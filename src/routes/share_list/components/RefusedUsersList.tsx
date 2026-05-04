import React from 'react';

import { Refresh } from 'components/ActionButtons';
import type { IUsersList } from 'typings';

export interface IRefusedUsersListProps {
  refreshShare: (id: string, userId: string) => void;
  userIsOwner: boolean;
  userId: string;
  users: IUsersList[];
}

const RefusedUsersList: React.FC<IRefusedUsersListProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <h2 className="tw:text-xl tw:font-semibold tw:capitalize tw:mb-3">Refused</h2>
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
        if (props.userIsOwner) {
          return (
            <div
              key={user.users_list.id}
              data-test-id={`refused-user-${user.user.id}`}
              className="refused-list-list-group-item tw:px-4 tw:py-3 tw:flex tw:items-center tw:justify-between"
            >
              <span>{user.user.email}</span>
              <div>
                <Refresh
                  testID="refresh-share"
                  handleClick={(): void => props.refreshShare(user.users_list.id, user.user.id)}
                />
              </div>
            </div>
          );
        }
        return (
          <div key={user.users_list.id} data-test-id={`refused-user-${user.user.id}`}>
            <div className="tw:px-4 tw:py-3">{user.user.email}</div>
          </div>
        );
      })}
    </div>
  </React.Fragment>
);

export default RefusedUsersList;
