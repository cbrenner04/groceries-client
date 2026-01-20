import React, { useState, type ChangeEventHandler, type ReactElement } from 'react';
import { ListGroup } from 'react-bootstrap';
import update from 'immutability-helper';
import { useNavigate } from 'react-router';

import { showToast } from '../../../utils/toast';

import axios from 'utils/api';
import ConfirmModal from 'components/ConfirmModal';
import type { IList, TUserPermissions } from 'typings';

import { sortLists, failure, pluralize } from '../utils';
import MergeModal from './MergeModal';
import List from './List';
import CompleteListButtons from './CompleteListButtons';
import IncompleteListButtons from './IncompleteListButtons';
import Lists from './Lists';

export interface IAcceptedListsProps {
  completed: boolean;
  title: ReactElement;
  userId: string;
  incompleteLists: IList[];
  setIncompleteLists: (lists: IList[]) => void;
  completedLists: IList[];
  setCompletedLists: (lists: IList[]) => void;
  currentUserPermissions: TUserPermissions;
  setCurrentUserPermissions: (permissions: TUserPermissions) => void;
  fullList: boolean;
}

const AcceptedLists: React.FC<IAcceptedListsProps> = (props): React.JSX.Element => {
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([] as IList[]);
  const [listsToDelete, setListsToDelete] = useState([] as IList[]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listsToMerge, setListsToMerge] = useState([] as IList[]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeName, setMergeName] = useState('');
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const resetMultiSelect = (): void => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const handleDelete = (list: IList): void => {
    const lists = selectedLists.length ? selectedLists : [list];
    setListsToDelete(lists);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    setShowDeleteConfirm(false);
    setPending(true);

    try {
      const requests = listsToDelete.map(async (list) => {
        // If user owns the list, delete it completely
        if (props.userId === list.owner_id) {
          await axios.delete(`/lists/${list.id}`);
        } else {
          // If user doesn't own the list, just refuse the share
          await axios.patch(`/lists/${list.id}/users_lists/${list.users_list_id}`, {
            users_list: { has_accepted: false },
          });
        }
      });

      await Promise.all(requests);

      if (props.completed) {
        const updatedCompletedLists = props.completedLists.filter(
          (nonList) => !listsToDelete.map((l) => l.id).includes(nonList.id),
        );
        props.setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedIncompleteLists = props.incompleteLists.filter(
          (nonList) => !listsToDelete.map((l) => l.id).includes(nonList.id),
        );
        props.setIncompleteLists(sortLists(updatedIncompleteLists));
      }

      resetMultiSelect();
      setListsToDelete([]);
      setPending(false);
      showToast.info(`${pluralize(listsToDelete.length)} successfully deleted.`);
    } catch (error: unknown) {
      failure(error, navigate, setPending);
    }
  };

  const handleMerge = (): void => {
    // just using the first list selected arbitrarily
    const configId = selectedLists[0].list_item_configuration_id;
    const filteredLists = selectedLists.filter((l) => l.list_item_configuration_id === configId);
    setListsToMerge(filteredLists);
    setShowMergeModal(true);
  };

  // TODO: this does not get triggered if you hit enter when in modal
  const handleMergeConfirm = async (): Promise<void> => {
    setShowMergeModal(false);
    setPending(true);
    const listIds = listsToMerge.map((l) => l.id).join(',');
    try {
      const { data } = await axios.post('/lists/merge_lists', {
        merge_lists: { list_ids: listIds, new_list_name: mergeName },
      });
      // it is unnecessary to update incompleteLists and currentUserPermissions when on completed list page
      if (!props.completed || !props.fullList) {
        const updatedCurrentUserPermissions = update(props.currentUserPermissions, { [data.id]: { $set: 'write' } });
        const updatedIncompleteLists = update(props.incompleteLists, { $push: [data] });
        // must update currentUserPermissions prior to incompleteLists
        props.setCurrentUserPermissions(updatedCurrentUserPermissions);
        props.setIncompleteLists(sortLists(updatedIncompleteLists));
      }
      resetMultiSelect();
      setListsToMerge([]);
      setPending(false);
      showToast.info('Lists successfully merged.');
    } catch (err) {
      failure(err, navigate, setPending);
    }
  };

  const handleCompletion = (list: IList): void => {
    const lists = selectedLists.length ? selectedLists : [list];
    // can only complete lists you own
    const ownedLists = lists.filter((l) => props.userId === l.owner_id);
    const filteredLists = ownedLists.filter((l) => !l.completed);
    const filteredListsIds = filteredLists.map((l) => l.id);
    const updateRequests = filteredLists.map((l) => axios.put(`/lists/${l.id}`, { list: { completed: true } }));

    setPending(true);
    Promise.all(updateRequests)
      .then(() => {
        const updatedIncompleteLists = props.incompleteLists.filter(
          (nonList) => !filteredListsIds.includes(nonList.id),
        );
        props.setIncompleteLists(sortLists(updatedIncompleteLists));
        let updatedCompletedLists = props.completedLists;
        filteredLists.forEach((l) => {
          l.completed = true;
          updatedCompletedLists = update(updatedCompletedLists, { $push: [l] });
        });
        props.setCompletedLists(sortLists(updatedCompletedLists));
        resetMultiSelect();
        setPending(false);
        showToast.info(`${pluralize(filteredLists.length)} successfully completed.`);
      })
      .catch((error) => {
        failure(error, navigate, setPending);
      });
  };

  const handleRefresh = (list: IList): void => {
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.map((l) => (props.userId === l.owner_id ? l : undefined)).filter(Boolean) as IList[];
    ownedLists.forEach((lList) => {
      lList.refreshed = true;
    });
    const refreshRequests = ownedLists.map((l) => axios.post(`/lists/${l.id}/refresh_list`, {}));

    setPending(true);
    Promise.all(refreshRequests)
      .then((responses) => {
        // it is unnecessary to update incompleteLists and currentUserPermissions when on completed list page
        if (!props.completed || !props.fullList) {
          let updatedCurrentUserPermissions = props.currentUserPermissions;
          let updatedIncompleteLists = props.incompleteLists;
          responses.forEach((response) => {
            updatedCurrentUserPermissions = update(updatedCurrentUserPermissions, {
              [response.data.id]: { $set: 'write' },
            });
            updatedIncompleteLists = update(updatedIncompleteLists, { $push: [response.data] });
          });
          // must update currentUserPermissions prior to incompleteLists
          props.setCurrentUserPermissions(updatedCurrentUserPermissions);
          props.setIncompleteLists(sortLists(updatedIncompleteLists));
        }
        resetMultiSelect();
        setPending(false);
        showToast.info(`${pluralize(ownedLists.length)} successfully refreshed.`);
      })
      .catch((error) => {
        failure(error, navigate, setPending);
      });
  };

  const lists = props.completed
    ? props.completedLists.map((list) => (
        <List
          list={list}
          key={list.id}
          multiSelect={multiSelect}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          listClass="accepted-list"
          testClass="completed-list"
          includeLinkToList={true}
          listName={`${list.name}${list.refreshed ? '*' : ''}`}
          listButtons={
            <CompleteListButtons
              userId={props.userId}
              list={list}
              onListDeletion={handleDelete}
              onListRefresh={handleRefresh}
              multiSelect={multiSelect}
              selectedLists={selectedLists}
              handleMerge={handleMerge}
              pending={pending}
            />
          }
        />
      ))
    : props.incompleteLists.map((list) => (
        <List
          list={list}
          key={list.id}
          multiSelect={multiSelect}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          listClass="accepted-list"
          testClass="incomplete-list"
          includeLinkToList={true}
          listName={list.name}
          listButtons={
            <IncompleteListButtons
              userId={props.userId}
              list={list}
              onListDeletion={handleDelete}
              onListCompletion={handleCompletion}
              currentUserPermissions={props.currentUserPermissions[list.id!]}
              multiSelect={multiSelect}
              selectedLists={selectedLists}
              handleMerge={handleMerge}
              pending={pending}
            />
          }
        />
      ));

  return (
    <Lists
      title={props.title}
      multiSelect={multiSelect}
      selectedLists={selectedLists}
      setSelectedLists={setSelectedLists}
      setMultiSelect={setMultiSelect}
    >
      <ListGroup>{lists}</ListGroup>
      <ConfirmModal
        action="delete"
        body={
          <React.Fragment>
            <p>
              Are you sure you want to remove the following lists? Lists you own will be deleted completely. Lists you
              do not own will continue to exist for the owner, you will just be removed from the list of users.
            </p>
            <p>{listsToDelete.map((list) => list.name).join(', ')}</p>
          </React.Fragment>
        }
        show={showDeleteConfirm}
        handleConfirm={(): Promise<void> => handleDeleteConfirm()}
        handleClear={(): void => setShowDeleteConfirm(false)}
      />
      <MergeModal
        showModal={showMergeModal}
        clearModal={(): void => setShowMergeModal(false)}
        listNames={listsToMerge.map((l) => l.name).join('", "')}
        mergeName={mergeName}
        handleMergeNameChange={((event) => setMergeName(event.target.value)) as ChangeEventHandler<HTMLInputElement>}
        handleMergeConfirm={handleMergeConfirm}
        selectedLists={selectedLists}
      />
    </Lists>
  );
};

export default AcceptedLists;
