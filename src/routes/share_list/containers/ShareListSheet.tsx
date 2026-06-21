import React, { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import { BottomSheet } from 'components/ui/BottomSheet';
import { Button } from 'components/ui/Button';
import Loading from 'components/Loading';
import type { IListUser, IUsersList } from 'typings';
import axios from 'utils/api';
import { usePolling } from 'hooks';

import { ShareListFormBody, ShareListFormFooter } from './ShareListForm';
import { fetchData } from '../utils';

export interface IShareListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
}

interface IShareData {
  invitableUsers: IListUser[];
  userIsOwner: boolean;
  pending: IUsersList[];
  accepted: IUsersList[];
  refused: IUsersList[];
  userId: string;
}

const ShareListSheet: React.FC<IShareListSheetProps> = (props): React.JSX.Element => {
  const { isOpen, onClose, listId, listName } = props;
  const navigate = useNavigate();
  const [data, setData] = useState<IShareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitableUsers, setInvitableUsers] = useState<IListUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [pendingUsers, setPendingUsers] = useState<IUsersList[]>([]);
  const [acceptedUsers, setAcceptedUsers] = useState<IUsersList[]>([]);
  const [refusedUsers, setRefusedUsers] = useState<IUsersList[]>([]);

  useEffect((): void => {
    if (!isOpen) {
      setData(null);
      return;
    }
    setLoading(true);
    void fetchData({ listId, navigate })
      .then((result): void => {
        if (result) {
          setData({
            invitableUsers: result.invitableUsers,
            userIsOwner: result.userIsOwner,
            pending: result.pending,
            accepted: result.accepted,
            refused: result.refused,
            userId: result.userId,
          });
          setInvitableUsers(result.invitableUsers);
          setPendingUsers(result.pending);
          setAcceptedUsers(result.accepted);
          setRefusedUsers(result.refused);
        } else {
          onClose();
        }
      })
      .finally((): void => setLoading(false));
  }, [isOpen, listId, navigate, onClose]);

  usePolling(
    async () => {
      try {
        const list = await fetchData({ listId, navigate: navigate });
        /* istanbul ignore else */
        if (list) {
          const isSameSet = (newSet: IListUser[] | IUsersList[], oldSet: IListUser[] | IUsersList[]): boolean =>
            JSON.stringify(newSet) === JSON.stringify(oldSet);
          /* istanbul ignore else */
          if (!isSameSet(list.invitableUsers, invitableUsers)) {
            setInvitableUsers(list.invitableUsers);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.pending, pendingUsers)) {
            setPendingUsers(list.pending);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.accepted, acceptedUsers)) {
            setAcceptedUsers(list.accepted);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.refused, refusedUsers)) {
            setRefusedUsers(list.refused);
          }
        }
      } catch {
        const errorMessage = 'You may not be connected to the internet. Please check your connection.';
        showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
      }
    },
    parseInt(import.meta.env.VITE_POLLING_INTERVAL ?? '5000', 10),
  );

  const failure = (err: unknown): void => {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        showToast.error('You must sign in');
        navigate('/users/sign_in');
      } else if (error.response.status === 403) {
        showToast.error('You do not have permission to take that action');
        navigate('/lists');
      } else if (error.response.status === 404) {
        showToast.error('User not found');
      } else {
        if ((error.response.data as Record<string, string>).responseText) {
          showToast.error((error.response.data as Record<string, string>).responseText);
        } else {
          const responseTextKeys = Object.keys(error.response.data as Record<string, string>);
          const responseErrors = responseTextKeys.map(
            (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          showToast.error(responseErrors.join(' and '));
        }
      }
    } else if (error.request) {
      showToast.error('Something went wrong');
    } else {
      showToast.error(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      const { data: responseData } = await axios.post('/auth/invitation', {
        email: newEmail,
        list_id: listId,
      });
      const newPending = update(pendingUsers, { $push: [responseData] });
      setPendingUsers(newPending);
      setNewEmail('');
      showToast.info(`"${listName}" has been successfully shared with ${newEmail}.`);
    } catch (error) {
      failure(error);
    }
  };

  const handleSelectUser = async (user: IListUser): Promise<void> => {
    try {
      const { data: responseData } = await axios.post(`/lists/${listId}/users_lists`, {
        users_list: { user_id: user.id, list_id: listId },
      });
      const newUsers = invitableUsers.filter((tmpUser: IListUser) => tmpUser.id !== user.id);
      setInvitableUsers(newUsers);
      const newPending = update(pendingUsers, {
        $push: [
          {
            user: { id: responseData.user_id, email: user.email },
            users_list: { id: responseData.id, permissions: responseData.permissions },
          },
        ],
      });

      setPendingUsers(newPending);
      showToast.info(`"${listName}" has been successfully shared with ${user.email}.`);
    } catch (error) {
      failure(error);
    }
  };

  const togglePermission = async (id: string, currentPermission: string, status: string): Promise<void> => {
    const permissions = currentPermission === 'write' ? 'read' : 'write';
    try {
      await axios.patch(`/lists/${listId}/users_lists/${id}`, { users_list: { permissions } });
      const [users, stateFunc] =
        status === 'pending' ? [pendingUsers, setPendingUsers] : [acceptedUsers, setAcceptedUsers];
      const updatedUsers = users.map((usersList) => {
        const newList = usersList;
        const tmpUsersList = newList.users_list;
        /* istanbul ignore else */
        if (tmpUsersList.id === id) {
          tmpUsersList.permissions = permissions;
        }
        return newList;
      });
      stateFunc(updatedUsers);
    } catch (error) {
      failure(error);
    }
  };

  const refreshShare = async (id: string, userId: string): Promise<void> => {
    const usersList = refusedUsers.find((user) => user.user.id === userId);
    /* istanbul ignore else */
    if (usersList) {
      const { user } = usersList;
      try {
        const { data: responseData } = await axios.patch(`/lists/${listId}/users_lists/${id}`, {
          users_list: { has_accepted: null, permissions: 'write' },
        });
        const updatedPending = update(pendingUsers, { $push: [{ user, users_list: responseData }] });
        setPendingUsers(updatedPending);
        const updatedRefused = refusedUsers.filter((user) => user.user.id !== userId);
        setRefusedUsers(updatedRefused);
      } catch (error) {
        failure(error);
      }
    }
  };

  const removeShare = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/lists/${listId}/users_lists/${id}`);
      const { data: responseData } = await axios.get(`/lists/${listId}/users_lists`);
      setAcceptedUsers(responseData.accepted);
      setInvitableUsers(responseData.invitable_users);
      setPendingUsers(responseData.pending);
      setRefusedUsers(responseData.refused);
    } catch (error) {
      failure(error);
    }
  };

  const renderBody = (): ReactNode => {
    if (loading) {
      return <Loading />;
    }
    if (!data) {
      return null;
    }
    return (
      <ShareListFormBody
        invitableUsers={invitableUsers}
        pending={pendingUsers}
        accepted={acceptedUsers}
        refused={refusedUsers}
        userIsOwner={data.userIsOwner}
        userId={data.userId}
        onSelectUser={handleSelectUser}
        onTogglePermission={togglePermission}
        onRefreshShare={refreshShare}
        onRemoveShare={removeShare}
      />
    );
  };

  const renderFooter = (): ReactNode => {
    if (loading || !data) {
      return null;
    }
    return (
      <div className="tw:flex tw:flex-col tw:gap-2">
        <ShareListFormFooter newEmail={newEmail} onEmailChange={setNewEmail} onSubmit={handleSubmit} />
        <Button variant="secondary" type="button" onClick={onClose} className="tw:w-full">
          Cancel
        </Button>
      </div>
    );
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Share ${listName}`}
      testId="share-list-sheet"
      footer={renderFooter()}
    >
      {renderBody()}
    </BottomSheet>
  );
};

export default ShareListSheet;
