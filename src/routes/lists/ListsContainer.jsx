import React, { useEffect, useState } from 'react';
import update from 'immutability-helper';

import Alert from '../../components/Alert';
import ListForm from './components/ListForm';
import Lists from './components/Lists';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';
import axios from '../../utils/api';

export default function ListsContainer(props) {
  const [userId, setUserId] = useState(0);
  const [pendingLists, setPendingLists] = useState([]);
  const [completedLists, setCompletedLists] = useState([]);
  const [nonCompletedLists, setNonCompletedLists] = useState([]);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [listToReject, setListToReject] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [currentUserPermissions, setCurrentUserPermissions] = useState('read');

  const sortLists = lists => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = JSON.parse(sessionStorage.getItem('user'));
        const { data, headers: responseHeaders } = await axios.get(`/lists/`, { headers });
        setUserInfo(responseHeaders);
        const sortedAcceptedLists = sortLists(data.accepted_lists);
        const sortedPendingLists = sortLists(data.pending_lists);
        const newCompletedLists = sortedAcceptedLists.filter(list => list.completed);
        const newNonCompletedLists = sortedAcceptedLists.filter(list => !list.completed);
        setUserId(data.current_user_id);
        setPendingLists(sortedPendingLists); // this should be sorted the opposite
        setCompletedLists(newCompletedLists);
        setNonCompletedLists(newNonCompletedLists);
        const lists = sortedAcceptedLists.concat(sortedPendingLists);
        const permissions = {};
        Promise.all(
          lists.map(list =>
            axios.get(`/lists/${list.id}/users_lists/${list.users_list_id}`, { headers }).catch(() => undefined),
          ),
        ).then(lists => {
          lists.forEach(listData => {
            const {
              data: { list_id: listId, permissions: listPerms },
            } = listData;
            permissions[listId] = listPerms;
          });
          setCurrentUserPermissions(permissions);
        }); // noop
      } catch ({ response, request, message }) {
        if (response) {
          setUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else {
            const responseTextKeys = Object.keys(response.data);
            const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
            setErrors(responseErrors.join(' and '));
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      }
    }

    fetchData();
  }, [props.history]);

  const handleAlertDismiss = () => {
    setErrors('');
    setSuccess('');
  };

  const failure = ({ request, response, message }) => {
    if (response) {
      setUserInfo(response.headers);
      if (response.status === 401) {
        // TODO: how do we pass error messages along?
        props.history.push('/users/sign_in');
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      }
    } else if (request) {
      // TODO: what do here?
    } else {
      setErrors(message);
    }
  };

  const handleFormSubmit = async list => {
    handleAlertDismiss();
    try {
      const { data, headers } = await axios.post(
        `/lists`,
        { list },
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setSuccess('List successfully added.');
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = list => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    handleAlertDismiss();
    const { id, completed } = listToDelete;
    try {
      const { headers } = await axios.delete(`/lists/${id}`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      });
      setUserInfo(headers);
      if (completed) {
        const updatedCompletedLists = completedLists.filter(ll => ll.id !== id);
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = nonCompletedLists.filter(ll => ll.id !== id);
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      setSuccess('List successfully deleted.');
    } catch (error) {
      failure(error);
    }
  };

  const handleCompletion = async list => {
    handleAlertDismiss();
    const theList = list;
    theList.completed = true;
    try {
      const { headers } = await axios.put(`/lists/${theList.id}`, 'list%5Bcompleted%5D=true', {
        headers: JSON.parse(sessionStorage.getItem('user')),
      });
      setUserInfo(headers);
      const updatedNonCompletedLists = nonCompletedLists.filter(nonList => nonList.id !== theList.id);
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      const updatedCompletedLists = update(completedLists, { $push: [theList] });
      setCompletedLists(sortLists(updatedCompletedLists));
      setSuccess('List successfully completed.');
    } catch (error) {
      failure(error);
    }
  };

  const removeListFromUnaccepted = listId => {
    const updatedPendingLists = pendingLists.filter(list => list.id !== listId);
    setPendingLists(updatedPendingLists);
  };

  const acceptList = async list => {
    handleAlertDismiss();
    try {
      const { headers } = await axios.patch(
        `/lists/${list.id}/users_lists/${list.users_list_id}`,
        'users_list%5Bhas_accepted%5D=true',
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      const { completed } = list;
      if (completed) {
        const updatedCompletedLists = update(completedLists, { $push: [list] });
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = update(nonCompletedLists, { $push: [list] });
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      setSuccess('List successfully accepted.');
    } catch (error) {
      failure(error);
    }
  };

  const handleAccept = list => {
    removeListFromUnaccepted(list.id);
    acceptList(list);
  };

  const handleReject = list => {
    setListToReject(list);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async () => {
    setShowRejectConfirm(false);
    handleAlertDismiss();
    try {
      const { headers } = await axios.patch(
        `/lists/${listToReject.id}/users_lists/${listToReject.users_list_id}`,
        'users_list%5Bhas_accepted%5D=false',
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      removeListFromUnaccepted(listToReject.id);
      setSuccess('List successfully rejected.');
    } catch (error) {
      failure(error);
    }
  };

  const handleRefresh = async list => {
    handleAlertDismiss();
    const localList = list;
    localList.refreshed = true;
    try {
      const { data, headers } = await axios.post(
        `/lists/${list.id}/refresh_list`,
        {},
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setSuccess('List successfully refreshed.');
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
      <Alert errors={errors} success={success} handleDismiss={handleAlertDismiss} />
      <h1>Lists</h1>
      <ListForm onFormSubmit={handleFormSubmit} />
      <hr />
      <Lists
        userId={userId}
        onListDelete={handleDelete}
        onListCompletion={handleCompletion}
        pendingLists={pendingLists}
        completedLists={completedLists}
        nonCompletedLists={nonCompletedLists}
        onListRefresh={handleRefresh}
        onAccept={handleAccept}
        onReject={handleReject}
        currentUserPermissions={currentUserPermissions}
      />
      <ConfirmModal
        action="delete"
        body="Are you sure you want to delete this list?"
        show={showDeleteConfirm}
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => setShowDeleteConfirm(false)}
      />
      <ConfirmModal
        action="reject"
        body="Are you sure you want to reject this list?"
        show={showRejectConfirm}
        handleConfirm={() => handleRejectConfirm()}
        handleClear={() => setShowRejectConfirm(false)}
      />
    </>
  );
}
