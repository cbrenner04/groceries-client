import React from 'react';

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
}

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
  } = props;

  const listId = item.list_id;
  const permission = permissions[listId];
  const canWrite = permission === EUserPermissions.WRITE;
  const testClassPrefix = item.completed ? 'completed' : 'not-completed';
  const testClass = item.completed ? 'completed-item' : 'non-completed-item';
  const primaryValue = getPrimaryFieldValue(fields);
  const secondaryFields = getSecondaryFields(fields);

  const renderActionButtons = (): React.JSX.Element | null => {
    if (!canWrite) {
      return null;
    }

    return (
      <div className="tw:flex tw:items-center tw:gap-1">
        {item.completed ? (
          item.refreshed ? null : (
            <IconButton
              icon={<RedoIcon size="sm" />}
              variant="primary"
              size="sm"
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
            icon={<CheckIcon size="sm" />}
            variant="success"
            size="sm"
            label="Complete"
            data-test-id={`not-completed-item-complete-${item.id}`}
            onClick={(e): void => {
              e.stopPropagation();
              onComplete(item.id);
            }}
          />
        )}
        <IconButton
          icon={<EditIcon size="sm" />}
          variant="default"
          size="sm"
          label="Edit"
          data-test-id={`${testClassPrefix}-item-edit-${item.id}`}
          onClick={(e): void => {
            e.stopPropagation();
            onEdit(item.id);
          }}
        />
        <IconButton
          icon={<TrashIcon size="sm" />}
          variant="danger"
          size="sm"
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
    <Card
      variant="interactive"
      selected={isMultiSelectActive && isSelected}
      completed={item.completed}
      data-test-class={testClass}
      data-test-id={`list-item-${item.id}`}
      className="tw:flex tw:items-center tw:gap-3"
    >
      {isMultiSelectActive && (
        <input
          type="checkbox"
          className="tw:w-5 tw:h-5 tw:cursor-pointer tw:flex-shrink-0"
          checked={isSelected}
          onChange={(): void => onSelect(item.id)}
          data-test-id={`${testClassPrefix}-item-select-${item.id}`}
          aria-label={`Select ${primaryValue || 'item'}`}
        />
      )}
      <div className="tw:flex-1 tw:min-w-0">
        <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
          <div className="tw:flex-1 tw:min-w-0">
            <div className="tw:text-base tw:font-medium tw:truncate">{primaryValue || 'Untitled Item'}</div>
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
  );
}
