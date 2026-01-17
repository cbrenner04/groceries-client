import React, { useState } from 'react';
import { ListGroup, ButtonGroup } from 'react-bootstrap';
import update from 'immutability-helper';
import { useNavigate } from 'react-router';

import { showToast } from '../../../utils/toast';

import TitlePopover from 'components/TitlePopover';
import ConfirmModal from 'components/ConfirmModal';
import axios from 'utils/api';
import { sortLists, failure, pluralize } from 'routes/lists/utils';
import { Complete, Trash } from 'components/ActionButtons';
import type { IList } from 'typings';

import List from './List';
import Lists from './Lists';

export interface IPendingListsProps {
  userId: string;
  pendingLists: IList[];
  setPendingLists: (lists: IList[]) => void;
  incompleteLists: IList[];
  setIncompleteLists: (lists: IList[]) => void;
  completedLists: IList[];
  setCompletedLists: (lists: IList[]) => void;
  currentUserPermissions: Record<string, string>;
}

const PendingLists: React.FC<IPendingListsProps> = (props): React.JSX.Element => {
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([] as IList[]);
  const [listsToReject, setListsToReject] = useState([] as IList[]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const resetMultiSelect = (): void => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const handleAccept = async (list: IList): Promise<void> => {
    setPending(true);
    const listsToAccept = selectedLists.length ? selectedLists : [list];
    const requests = listsToAccept.map((l) =>
      axios.patch(`/v2/lists/${l.id}/users_lists/${l.users_list_id}`, { users_list: { has_accepted: true } }),
    );
    try {
      await Promise.all(requests);
      let updatedCompletedLists = props.completedLists;
      let updatedIncompleteLists = props.incompleteLists;
      let updatedPendingLists = props.pendingLists;
      listsToAccept.forEach((l) => {
        if (l.completed) {
          updatedCompletedLists = update(updatedCompletedLists, { $push: [l] });
        } else {
          updatedIncompleteLists = update(updatedIncompleteLists, { $push: [l] });
        }
        updatedPendingLists = updatedPendingLists.filter((ll) => ll.id !== l.id);
      });
      props.setCompletedLists(sortLists(updatedCompletedLists));
      props.setIncompleteLists(sortLists(updatedIncompleteLists));
      props.setPendingLists(updatedPendingLists);
      // otherwise PendingLists will be unmounted
      if (updatedPendingLists.length) {
        resetMultiSelect();
        setPending(false);
      }
      showToast.info(`${pluralize(listsToAccept.length)} successfully accepted.`);
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleReject = (list: IList): void => {
    const rejectLists = selectedLists.length ? selectedLists : [list];
    setListsToReject(rejectLists);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async (): Promise<void> => {
    setPending(true);
    setShowRejectConfirm(false);
    const requests = listsToReject.map((l) =>
      axios.patch(`/v2/lists/${l.id}/users_lists/${l.users_list_id}`, {
        users_list: { has_accepted: false },
      }),
    );
    try {
      await Promise.all(requests);
      let updatedPendingLists = props.pendingLists;
      listsToReject.forEach((l) => {
        updatedPendingLists = updatedPendingLists.filter((list) => list.id !== l.id);
      });
      props.setPendingLists(updatedPendingLists);
      // otherwise PendingLists will be unmounted
      if (updatedPendingLists.length) {
        resetMultiSelect();
        setListsToReject([]);
        setPending(false);
      }
      showToast.info(`${pluralize(listsToReject.length)} successfully rejected.`);
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  return (
    <Lists
      title={
        <TitlePopover
          title="Pending"
          message="These lists have been shared with you but you have not accepted the invitation."
        />
      }
      multiSelect={multiSelect}
      selectedLists={selectedLists}
      setSelectedLists={setSelectedLists}
      setMultiSelect={setMultiSelect}
    >
      <ListGroup>
        {props.pendingLists.map((list) => (
          <List
            list={list}
            key={list.id}
            multiSelect={multiSelect}
            selectedLists={selectedLists}
            setSelectedLists={setSelectedLists}
            listClass="pending-list"
            testClass="pending-list"
            includeLinkToList={false}
            listName={list.name}
            listButtons={
              <ButtonGroup className="float-end">
                <Complete
                  handleClick={(): Promise<void> => handleAccept(list)}
                  testID="pending-list-accept"
                  disabled={pending}
                />
                <Trash handleClick={(): void => handleReject(list)} testID="pending-list-trash" disabled={pending} />
              </ButtonGroup>
            }
          />
        ))}
      </ListGroup>
      <ConfirmModal
        action="reject"
        body={`Are you sure you want to reject the following lists? ${listsToReject
          .map((list) => list.name)
          .join(', ')}`}
        show={showRejectConfirm}
        handleConfirm={(): Promise<void> => handleRejectConfirm()}
        handleClear={(): void => setShowRejectConfirm(false)}
      />
    </Lists>
  );
};

export default PendingLists;
