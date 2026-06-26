import React from 'react';
import type { VariantProps } from 'class-variance-authority';

import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { CheckIcon, EditIcon, RedoIcon, TrashIcon, UsersIcon } from '../icons';
import { listCardVariants } from './ListCard.variants';
import type { IList, TUserPermissions } from 'typings';

export type IListCardVariants = VariantProps<typeof listCardVariants>;

export interface IListCardProps {
  list: IList;
  userId: string;
  currentUserPermissions: TUserPermissions;
  isMultiSelectActive: boolean;
  isSelected: boolean;
  onSelect: (listId: string) => void;
  onComplete: (listId: string) => void;
  onShare: (listId: string) => void;
  onEdit: (listId: string) => void;
  onDelete: (listId: string) => void;
  onRefresh: (listId: string) => void;
  onAccept: (listId: string) => void;
  onReject: (listId: string) => void;
  onClick: (listId: string) => void;
  templateName?: string;
}

function isPending(list: IList): boolean {
  return list.has_accepted === null || list.has_accepted === undefined;
}

function getTestClass(list: IList): string {
  if (isPending(list)) {
    return 'pending-list';
  }
  return list.completed ? 'completed-list' : 'incomplete-list';
}

export function ListCard(props: IListCardProps): React.JSX.Element {
  const {
    list,
    userId,
    currentUserPermissions,
    isMultiSelectActive,
    isSelected,
    onSelect,
    onComplete,
    onShare,
    onEdit,
    onDelete,
    onRefresh,
    onAccept,
    onReject,
    onClick,
    templateName,
  } = props;

  const listId = list.id ?? '';
  const pending = isPending(list);
  const permission = currentUserPermissions[listId];
  const isOwner = userId === list.owner_id;
  const testClass = getTestClass(list);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (isMultiSelectActive) {
      onSelect(listId);
    } else {
      onClick(listId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  const renderActionButtons = (): React.JSX.Element | null => {
    if (pending) {
      return (
        <div className="tw:flex tw:items-center tw:gap-1">
          <IconButton
            icon={<CheckIcon size="lg" />}
            variant="success"
            size="md"
            label="Accept"
            data-test-id="pending-list-accept"
            onClick={(e): void => {
              e.stopPropagation();
              onAccept(listId);
            }}
          />
          <IconButton
            icon={<TrashIcon size="lg" />}
            variant="danger"
            size="md"
            label="Reject"
            data-test-id="pending-list-trash"
            onClick={(e): void => {
              e.stopPropagation();
              onReject(listId);
            }}
          />
        </div>
      );
    }

    if (list.completed) {
      return (
        <div className="tw:flex tw:items-center tw:gap-1">
          <IconButton
            icon={<RedoIcon size="lg" />}
            variant="primary"
            size="md"
            label="Refresh"
            data-test-id="complete-list-refresh"
            disabled={!isOwner}
            onClick={(e): void => {
              e.stopPropagation();
              onRefresh(listId);
            }}
          />
          <IconButton
            icon={<TrashIcon size="lg" />}
            variant="danger"
            size="md"
            label="Delete"
            data-test-id="complete-list-trash"
            onClick={(e): void => {
              e.stopPropagation();
              onDelete(listId);
            }}
          />
        </div>
      );
    }

    return (
      <div className="tw:flex tw:items-center tw:gap-1">
        {isOwner && (
          <IconButton
            icon={<CheckIcon size="lg" />}
            variant="success"
            size="md"
            label="Complete"
            data-test-id="incomplete-list-complete"
            onClick={(e): void => {
              e.stopPropagation();
              onComplete(listId);
            }}
          />
        )}
        {permission === 'write' && (
          <IconButton
            icon={<UsersIcon size="lg" />}
            variant="default"
            size="md"
            label="Share"
            data-test-id="incomplete-list-share"
            onClick={(e): void => {
              e.stopPropagation();
              onShare(listId);
            }}
          />
        )}
        {isOwner && (
          <IconButton
            icon={<EditIcon size="lg" />}
            variant="accent"
            size="md"
            label="Edit"
            data-test-id="incomplete-list-edit"
            onClick={(e): void => {
              e.stopPropagation();
              onEdit(listId);
            }}
          />
        )}
        <IconButton
          icon={<TrashIcon size="lg" />}
          variant="danger"
          size="md"
          label="Delete"
          data-test-id="incomplete-list-trash"
          onClick={(e): void => {
            e.stopPropagation();
            onDelete(listId);
          }}
        />
      </div>
    );
  };

  const showMultiSelectControls = isMultiSelectActive && !pending;

  return (
    <Card
      variant="interactive"
      selected={isMultiSelectActive && isSelected}
      completed={list.completed ?? false}
      data-test-id={`list-${listId}`}
      data-test-class={testClass}
      className={listCardVariants({ pending })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {showMultiSelectControls && (
        <input
          type="checkbox"
          data-test-id={`list-select-${listId}`}
          className="tw:w-5 tw:h-5 tw:cursor-pointer tw:flex-shrink-0"
          checked={isSelected}
          onChange={(): void => onSelect(listId)}
          onClick={(e): void => e.stopPropagation()}
          aria-label={`Select ${list.name}`}
        />
      )}
      <div className="tw:flex-1 tw:min-w-0">
        <div className="tw:flex tw:items-center tw:gap-2">
          <span className="tw:text-base tw:font-semibold tw:truncate" data-test-id="list-name">
            {list.name}
            {list.refreshed && '*'}
          </span>
        </div>
      </div>
      {isMultiSelectActive && templateName && (
        <div className="tw:flex tw:justify-center tw:text-center tw:min-w-0">
          <span
            data-test-id="list-template-type"
            className="tw:text-sm tw:italic tw:text-[var(--color-text-tertiary)] tw:truncate"
          >
            {templateName}
          </span>
        </div>
      )}
      {!showMultiSelectControls && <div className="tw:flex-shrink-0">{renderActionButtons()}</div>}
    </Card>
  );
}
