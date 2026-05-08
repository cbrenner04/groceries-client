import React, { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { BottomSheet } from 'components/ui/BottomSheet';
import Loading from 'components/Loading';
import type { IListUser, IUsersList } from 'typings';

import ShareListForm from './ShareListForm';
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
  const [pending, setPending] = useState(false);

  useEffect((): void => {
    if (!isOpen) {
      setData(null);
      return;
    }
    setPending(true);
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
        } else {
          onClose();
        }
      })
      .finally((): void => setPending(false));
  }, [isOpen, listId, navigate, onClose]);

  const renderBody = (): ReactNode => {
    if (pending) {
      return <Loading />;
    }
    if (!data) {
      return null;
    }
    return (
      <ShareListForm
        name={listName}
        listId={listId}
        invitableUsers={data.invitableUsers}
        userIsOwner={data.userIsOwner}
        pending={data.pending}
        accepted={data.accepted}
        refused={data.refused}
        userId={data.userId}
        onClose={onClose}
      />
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Share ${listName}`} testId="share-list-sheet">
      {renderBody()}
    </BottomSheet>
  );
};

export default ShareListSheet;
