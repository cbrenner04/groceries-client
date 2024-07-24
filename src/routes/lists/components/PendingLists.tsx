import React, { useState } from 'react';
import { ListGroup, ButtonGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import TitlePopover from '../../../components/TitlePopover';
import ConfirmModal from '../../../components/ConfirmModal';
import List from './List';
import axios from '../../../utils/api';
import { sortLists, failure, pluralize } from '../utils';
import { Complete, Trash } from '../../../components/ActionButtons';
import Lists from './Lists';
import { useNavigate } from 'react-router-dom';
import { IList } from '../../../typings';

interface IPendingListsProps {
  userId: string;
  pendingLists: IList[];
  setPendingLists: (lists: IList[]) => void;
  incompleteLists: IList[];
  setIncompleteLists: (lists: IList[]) => void;
  completedLists: IList[];
  setCompletedLists: (lists: IList[]) => void;
  currentUserPermissions: Record<string, string>;
}

const PendingLists: React.FC<IPendingListsProps> = (props) => {
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([] as IList[]);
  const [listsToReject, setListsToReject] = useState([] as IList[]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const resetMultiSelect = () => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const handleAccept = async (list: IList) => {
    setPending(true);
    const listsToAccept = selectedLists.length ? selectedLists : [list];
    const requests = listsToAccept.map((l) =>
      axios.patch(`/lists/${l.id}/users_lists/${l.users_list_id}`, { users_list: { has_accepted: true } }),
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
      toast(`${pluralize(listsToReject.length)} successfully accepted.`, { type: 'info' });
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleReject = (list: IList) => {
    const rejectLists = selectedLists.length ? selectedLists : [list];
    setListsToReject(rejectLists);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async () => {
    setPending(true);
    setShowRejectConfirm(false);
    const requests = listsToReject.map((l) =>
      axios.patch(`/lists/${l.id}/users_lists/${l.users_list_id}`, {
        users_list: { has_accepted: false },
      }),
    );
    try {
      await Promise.all(requests);
      let updatedPendingLists = props.pendingLists;
      listsToReject.forEach(({ id }) => {
        updatedPendingLists = updatedPendingLists.filter((list) => list.id !== id);
      });
      props.setPendingLists(updatedPendingLists);
      // otherwise PendingLists will be unmounted
      if (updatedPendingLists.length) {
        resetMultiSelect();
        setListsToReject([]);
        setPending(false);
      }
      toast(`${pluralize(listsToReject.length)} successfully rejected.`, { type: 'info' });
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
                <Complete handleClick={() => handleAccept(list)} testID="pending-list-accept" disabled={pending} />
                <Trash handleClick={() => handleReject(list)} testID="pending-list-trash" disabled={pending} />
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
        handleConfirm={() => handleRejectConfirm()}
        handleClear={() => setShowRejectConfirm(false)}
      />
    </Lists>
  );
};

export default PendingLists;
