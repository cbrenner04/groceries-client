import React from 'react';

import { Trash } from 'components/ActionButtons';
import { AngleDoubleDownIcon, AngleDoubleUpIcon } from 'components/icons';
import TitlePopover from 'components/TitlePopover';
import { Badge } from 'components/ui/Badge';
import type { IUsersList } from 'typings';

export interface IUsersListProps {
  togglePermission: (id: string, permissions: string, status: string) => void;
  removeShare: (id: string) => void;
  userIsOwner: boolean;
  userId: string;
  status: string;
  users: IUsersList[];
}

const UsersList: React.FC<IUsersListProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <TitlePopover
      title={props.status}
      message="Click the arrows to upgrade or downgrade the permissions between read and write"
    />
    <div
      className={
        'tw:mb-4 tw:border tw:border-[var(--color-border)] tw:rounded-lg ' +
        'tw:divide-y tw:divide-[var(--color-border)]'
      }
    >
      {props.users.map((user) => {
        if (user.user.id === props.userId) {
          return '';
        }
        const { permissions } = user.users_list;
        if (props.userIsOwner) {
          return (
            <div
              key={user.users_list.id}
              data-test-id={`${props.status}-user-${user.user.id}`}
              className="users-list-list-group-item tw:px-4 tw:py-3"
            >
              <div className="tw:flex tw:items-center tw:justify-between tw:gap-3">
                <span>{user.user.email}</span>
                <div className="tw:flex tw:items-center tw:gap-3">
                  <Badge
                    variant={permissions === 'write' ? 'success' : 'primary'}
                    data-test-id={`perm-${permissions}`}
                    className="badge"
                  >
                    {permissions}
                  </Badge>
                  <button
                    type="button"
                    className="tw:bg-transparent tw:border-0 tw:p-0 tw:cursor-pointer tw:text-amber-500"
                    onClick={(): void => props.togglePermission(user.users_list.id, permissions, props.status)}
                    data-test-id="toggle-permissions"
                  >
                    {permissions === 'write' ? <AngleDoubleDownIcon size="2x" /> : <AngleDoubleUpIcon size="2x" />}
                  </button>
                  <Trash testID="remove-share" handleClick={(): void => props.removeShare(user.users_list.id)} />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key={user.users_list.id} data-test-id={`${props.status}-user-${user.user.id}`}>
            <div className="tw:px-4 tw:py-3">{user.user.email}</div>
          </div>
        );
      })}
    </div>
  </React.Fragment>
);

export default UsersList;
