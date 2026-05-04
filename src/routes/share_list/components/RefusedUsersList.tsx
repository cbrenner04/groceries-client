import React from 'react';

import { IconButton } from 'components/ui/IconButton';
import { RedoIcon } from 'components/icons';
import type { IUsersList } from 'typings';

export interface IRefusedUsersListProps {
  refreshShare: (id: string, userId: string) => void;
  userIsOwner: boolean;
  userId: string;
  users: IUsersList[];
}

const sectionLabel = 'tw:text-xs tw:uppercase tw:tracking-wide tw:text-[var(--color-text-secondary)] tw:mb-2';
const rowClass =
  'tw:flex tw:items-center tw:justify-between tw:gap-3 tw:py-2 tw:border-b tw:border-[var(--color-border)]';

const RefusedUsersList: React.FC<IRefusedUsersListProps> = (props): React.JSX.Element => (
  <section className="tw:mb-4">
    <h3 className={sectionLabel}>Declined</h3>
    <ul className="tw:flex tw:flex-col">
      {props.users.map((user) => {
        if (user.user.id === props.userId) {
          return null;
        }
        if (!props.userIsOwner) {
          return (
            <li key={user.users_list.id} data-test-id={`refused-user-${user.user.id}`} className={rowClass}>
              <span className="tw:text-sm">{user.user.email}</span>
            </li>
          );
        }
        return (
          <li key={user.users_list.id} data-test-id={`refused-user-${user.user.id}`} className={rowClass}>
            <span className="tw:text-sm tw:flex-1 tw:truncate">{user.user.email}</span>
            <IconButton
              icon={<RedoIcon size="sm" />}
              variant="primary"
              size="sm"
              label="Re-share"
              data-test-id="refresh-share"
              onClick={(): void => props.refreshShare(user.users_list.id, user.user.id)}
            />
          </li>
        );
      })}
    </ul>
  </section>
);

export default RefusedUsersList;
