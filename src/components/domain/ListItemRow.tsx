import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { CheckIcon, EditIcon, RedoIcon, TrashIcon } from '../icons';
import type { IListItem, IListItemField, IListItemFieldConfiguration, TUserPermissions } from 'typings';
import { EListItemFieldType, EUserPermissions } from 'typings';
import { prettyDueBy } from 'utils/format';

export interface IListItemRowProps {
  item: IListItem;
  listId: string;
  fields: IListItemField[];
  fieldConfigurations: IListItemFieldConfiguration[];
  isMultiSelectActive: boolean;
  isSelected: boolean;
  onSelect: (itemId: string) => void;
  onComplete: (itemId: string) => void;
  onRefresh: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  permissions: TUserPermissions;
  itemAnimationState?: TListItemAnimationState;
  animationIndex?: number;
}

export type TListItemAnimationState = 'none' | 'added' | 'completed' | 'refreshed' | 'rollback';

function getPrimaryFieldValue(fields: IListItemField[]): string {
  if (!Array.isArray(fields) || fields.length === 0) {
    return '';
  }
  const primary = fields.find((f) => f.primary === true);
  if (primary?.data) {
    return String(primary.data);
  }
  const fallback = fields.find((f) => f.primary !== true && f.data);
  return fallback?.data ? String(fallback.data) : '';
}

function getSecondaryFields(fields: IListItemField[]): { label: string; value: string }[] {
  if (!Array.isArray(fields) || fields.length === 0) {
    return [];
  }
  const primaryFields = fields.filter((f) => f.primary === true);
  const hasPrimaryField = primaryFields.length > 0 && primaryFields[0]?.data;
  const fallbackPrimaryField = hasPrimaryField ? null : fields.find((f) => f.primary !== true && f.data);

  return fields
    .filter((f) => {
      if (f.primary === true) {
        return false;
      }
      if (f.id === fallbackPrimaryField?.id) {
        return false;
      }
      return true;
    })
    .map((f) => {
      if (f.data_type === EListItemFieldType.DATE_TIME && f.data) {
        return { label: f.label, value: prettyDueBy(String(f.data)) };
      }
      return { label: f.label, value: f.data ? String(f.data) : '' };
    });
}

export function ListItemRow(props: IListItemRowProps): React.JSX.Element {
  const {
    item,
    fields,
    isMultiSelectActive,
    isSelected,
    onSelect,
    onComplete,
    onRefresh,
    onEdit,
    onDelete,
    permissions,
    itemAnimationState = 'none',
    animationIndex = 0,
  } = props;

  const [wasJustCompleted, setWasJustCompleted] = useState(false);
  const [previousCompleted, setPreviousCompleted] = useState(item.completed);

  useEffect(() => {
    if (item.completed && !previousCompleted) {
      setWasJustCompleted(true);
      const timer = setTimeout(() => setWasJustCompleted(false), 600);
      return (): void => clearTimeout(timer);
    }
    setPreviousCompleted(item.completed);
  }, [item.completed, previousCompleted]);

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || import.meta.env.VITEST === 'true';
  const canAnimate = !prefersReducedMotion;

  const listId = item.list_id;
  const permission = permissions[listId];
  const canWrite = permission === EUserPermissions.WRITE;
  const testClassPrefix = item.completed ? 'completed' : 'not-completed';
  const testClass = item.completed ? 'completed-item' : 'non-completed-item';
  const primaryValue = getPrimaryFieldValue(fields);
  const secondaryFields = getSecondaryFields(fields);
  const animationDelay = Math.min(animationIndex * 0.03, 0.18);

  const rowInitial =
    canAnimate && itemAnimationState === 'added'
      ? {
          opacity: 0,
          x: -16,
          backgroundColor: 'rgba(34, 197, 94, 0.18)',
          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
        }
      : { opacity: 1, x: 0, backgroundColor: 'rgba(34, 197, 94, 0)', boxShadow: '0 0 0 1px rgba(34, 197, 94, 0)' };
  const rowAnimate = canAnimate
    ? {
        opacity: wasJustCompleted ? 0.6 : 1,
        scale: itemAnimationState === 'completed' ? [1, 0.98, 1] : wasJustCompleted ? 0.98 : 1,
        x: itemAnimationState === 'rollback' ? [-6, 6, -4, 0] : itemAnimationState === 'refreshed' ? [18, 0] : 0,
        backgroundColor:
          itemAnimationState === 'rollback'
            ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)']
            : itemAnimationState === 'refreshed'
              ? ['rgba(59, 130, 246, 0.18)', 'rgba(59, 130, 246, 0)']
              : itemAnimationState === 'added' || itemAnimationState === 'completed'
                ? ['rgba(34, 197, 94, 0.18)', 'rgba(34, 197, 94, 0)']
                : 'rgba(34, 197, 94, 0)',
        boxShadow:
          itemAnimationState === 'rollback'
            ? ['0 0 0 1px rgba(239, 68, 68, 0.28)', '0 0 0 1px rgba(239, 68, 68, 0)']
            : itemAnimationState === 'refreshed'
              ? ['0 0 0 1px rgba(59, 130, 246, 0.24)', '0 0 0 1px rgba(59, 130, 246, 0)']
              : itemAnimationState === 'added' || itemAnimationState === 'completed'
                ? ['0 0 0 1px rgba(34, 197, 94, 0.2)', '0 0 0 1px rgba(34, 197, 94, 0)']
                : '0 0 0 1px rgba(34, 197, 94, 0)',
      }
    : {
        opacity: 1,
        scale: 1,
        x: 0,
        backgroundColor: 'rgba(34, 197, 94, 0)',
        boxShadow: '0 0 0 1px rgba(34, 197, 94, 0)',
      };

  const renderSelectCheckbox = (): React.JSX.Element | null => {
    const checkbox = (
      <input
        type="checkbox"
        className="tw:w-5 tw:h-5 tw:cursor-pointer tw:flex-shrink-0"
        checked={isSelected}
        onChange={(): void => onSelect(item.id)}
        data-test-id={`${testClassPrefix}-item-select-${item.id}`}
        aria-label={`Select ${primaryValue || 'item'}`}
      />
    );

    if (!canAnimate) {
      return isMultiSelectActive ? checkbox : null;
    }

    return (
      <AnimatePresence initial={false}>
        {isMultiSelectActive ? (
          <motion.input
            key="select-checkbox"
            type="checkbox"
            className="tw:w-5 tw:h-5 tw:cursor-pointer tw:flex-shrink-0"
            checked={isSelected}
            onChange={(): void => onSelect(item.id)}
            data-test-id={`${testClassPrefix}-item-select-${item.id}`}
            aria-label={`Select ${primaryValue || 'item'}`}
            initial={{ opacity: 0, scale: 0.8, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -8 }}
            transition={{ duration: 0.18, delay: animationDelay }}
          />
        ) : null}
      </AnimatePresence>
    );
  };

  const renderActionButtons = (): React.JSX.Element | null => {
    if (!canWrite) {
      return null;
    }

    return (
      <div className="tw:flex tw:items-center tw:gap-1">
        {item.completed ? (
          item.refreshed ? null : (
            <IconButton
              icon={<RedoIcon size="lg" />}
              variant="primary"
              size="md"
              label="Refresh"
              data-test-id={`completed-item-refresh-${item.id}`}
              onClick={(e): void => {
                e.stopPropagation();
                onRefresh(item.id);
              }}
            />
          )
        ) : (
          <IconButton
            icon={<CheckIcon size="lg" />}
            variant="success"
            size="md"
            label="Complete"
            data-test-id={`not-completed-item-complete-${item.id}`}
            onClick={(e): void => {
              e.stopPropagation();
              onComplete(item.id);
            }}
          />
        )}
        <IconButton
          icon={<EditIcon size="lg" />}
          variant="default"
          size="md"
          label="Edit"
          data-test-id={`${testClassPrefix}-item-edit-${item.id}`}
          onClick={(e): void => {
            e.stopPropagation();
            onEdit(item.id);
          }}
        />
        <IconButton
          icon={<TrashIcon size="lg" />}
          variant="danger"
          size="md"
          label="Delete"
          data-test-id={`${testClassPrefix}-item-delete-${item.id}`}
          onClick={(e): void => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={rowInitial}
      animate={rowAnimate}
      transition={{ duration: 0.42, ease: 'easeInOut' }}
      style={{ borderRadius: 8 }}
    >
      <Card
        variant="interactive"
        selected={isMultiSelectActive && isSelected}
        completed={item.completed}
        data-test-class={testClass}
        data-test-id={`list-item-${item.id}`}
        className="tw:flex tw:items-center tw:gap-3"
      >
        {renderSelectCheckbox()}
        <div className="tw:flex-1 tw:min-w-0">
          <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
            <div className="tw:flex-1 tw:min-w-0">
              <motion.div
                className="tw:text-base tw:font-medium tw:truncate"
                animate={canAnimate ? { textDecorationLine: item.completed ? 'line-through' : 'none' } : undefined}
                transition={{ duration: 0.24 }}
              >
                {primaryValue || 'Untitled Item'}
              </motion.div>
              {secondaryFields.length > 0 && (
                <div className="tw:text-sm tw:text-[var(--color-text-secondary)] tw:truncate tw:mt-0.5">
                  {secondaryFields.map((field, index) => (
                    <span key={field.label}>
                      {index > 0 && <span className="tw:mx-1">&middot;</span>}
                      <span>{field.value}</span>
                    </span>
                  ))}
                </div>
              )}
              {item.category && (
                <div className="tw:mt-1">
                  <Badge>{item.category}</Badge>
                </div>
              )}
            </div>
            <div className="tw:flex-shrink-0">{renderActionButtons()}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
