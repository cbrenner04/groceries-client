import React from 'react';

import { Badge } from 'components/ui/Badge';
import { IconButton } from 'components/ui/IconButton';
import { TrashIcon, AngleDoubleDownIcon, AngleDoubleUpIcon } from 'components/icons';
import type { IUsersList } from 'typings';

export interface IUsersListProps {
  togglePermission: (id: string, permissions: string, status: string) => void;
  removeShare: (id: string) => void;
  userIsOwner: boolean;
  userId: string;
  status: string;
  users: IUsersList[];
}

const sectionLabel = 'tw:text-xs tw:uppercase tw:tracking-wide tw:text-[var(--color-text-secondary)] tw:mb-2';
const rowClass =
  'tw:flex tw:items-center tw:justify-between tw:gap-3 tw:py-2 tw:border-b tw:border-[var(--color-border)]';

const UsersList: React.FC<IUsersListProps> = (props): React.JSX.Element => (
  <section className="tw:mb-4">
    <h3 className={sectionLabel}>{props.status === 'pending' ? 'Pending' : 'Shared'}</h3>
    <ul className="tw:flex tw:flex-col">
      {props.users.map((user) => {
        if (user.user.id === props.userId) {
          return null;
        }
        const { permissions } = user.users_list;
        if (!props.userIsOwner) {
          return (
            <li key={user.users_list.id} data-test-id={`${props.status}-user-${user.user.id}`} className={rowClass}>
              <span className="tw:text-sm">{user.user.email}</span>
            </li>
          );
        }
        return (
          <li key={user.users_list.id} data-test-id={`${props.status}-user-${user.user.id}`} className={rowClass}>
            <span className="tw:text-sm tw:flex-1 tw:truncate">{user.user.email}</span>
            <button
              type="button"
              data-test-id="toggle-permissions"
              onClick={(): void => props.togglePermission(user.users_list.id, permissions, props.status)}
              className="tw:flex tw:items-center tw:gap-1 tw:cursor-pointer"
              aria-label="Toggle permissions"
            >
              <Badge
                data-test-id={`perm-${permissions}`}
                variant={props.status === 'pending' ? 'warning' : permissions === 'write' ? 'success' : 'primary'}
              >
                {props.status === 'pending' ? 'pending' : permissions}
              </Badge>
              {permissions === 'write' ? (
                <AngleDoubleDownIcon size="sm" className="tw:text-[var(--color-text-secondary)]" />
              ) : (
                <AngleDoubleUpIcon size="sm" className="tw:text-[var(--color-text-secondary)]" />
              )}
            </button>
            <IconButton
              icon={<TrashIcon size="sm" />}
              variant="danger"
              size="sm"
              label="Remove share"
              data-test-id="remove-share"
              onClick={(): void => props.removeShare(user.users_list.id)}
            />
          </li>
        );
      })}
    </ul>
  </section>
);

export default UsersList;
