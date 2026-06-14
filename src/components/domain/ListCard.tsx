import React from 'react';

import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';
import { CheckIcon, EditIcon, RedoIcon, TrashIcon, UsersIcon } from '../icons';
import type { IList, TUserPermissions } from 'typings';

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
}

function isPending(list: IList): boolean {
  // A list is pending if has_accepted is null/undefined (not yet accepted or rejected)
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
  } = props;

  const listId = list.id ?? '';
  const pending = isPending(list);
  const permission = currentUserPermissions[listId];
  const isOwner = userId === list.owner_id;
  const testClass = getTestClass(list);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    if (isMultiSelectActive) {
      onSelect(listId);
    } else {
      onClick(listId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  const renderActionButtons = (): React.JSX.Element | null => {
    if (pending) {
      return (
        <div className="tw:flex tw:items-center tw:gap-1">
          <IconButton
            icon={<CheckIcon size="sm" />}
            variant="success"
            size="sm"
            label="Accept"
            data-test-id="pending-list-accept"
            onClick={(e): void => {
              e.stopPropagation();
              onAccept(listId);
            }}
          />
          <IconButton
            icon={<TrashIcon size="sm" />}
            variant="danger"
            size="sm"
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
            icon={<RedoIcon size="sm" />}
            variant="primary"
            size="sm"
            label="Refresh"
            data-test-id="complete-list-refresh"
            disabled={!isOwner}
            onClick={(e): void => {
              e.stopPropagation();
              onRefresh(listId);
            }}
          />
          <IconButton
            icon={<TrashIcon size="sm" />}
            variant="danger"
            size="sm"
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
            icon={<CheckIcon size="sm" />}
            variant="success"
            size="sm"
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
            icon={<UsersIcon size="sm" />}
            variant="primary"
            size="sm"
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
            icon={<EditIcon size="sm" />}
            variant="default"
            size="sm"
            label="Edit"
            data-test-id="incomplete-list-edit"
            onClick={(e): void => {
              e.stopPropagation();
              onEdit(listId);
            }}
          />
        )}
        <IconButton
          icon={<TrashIcon size="sm" />}
          variant="danger"
          size="sm"
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

  const pendingBorderStyle = pending ? ' tw:border-l-4 tw:border-l-[var(--color-warning)]' : '';

  return (
    <Card
      variant="interactive"
      selected={isMultiSelectActive && isSelected}
      completed={list.completed ?? false}
      data-test-id={`list-${listId}`}
      data-test-class={testClass}
      className={`tw:flex tw:items-center tw:gap-3${pendingBorderStyle}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {isMultiSelectActive && (
        <input
          type="checkbox"
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
      <div className="tw:flex-shrink-0">{renderActionButtons()}</div>
    </Card>
  );
}
