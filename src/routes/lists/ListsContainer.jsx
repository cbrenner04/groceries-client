import React, { useEffect, useState } from 'react';
import update from 'immutability-helper';
import * as $ from 'jquery';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import ListForm from './components/ListForm';
import Lists from './components/Lists';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';

export default function ListsContainer(props) {
  const [userId, setUserId] = useState(0);
  const [pendingLists, setPendingLists] = useState([]);
  const [completedLists, setCompletedLists] = useState([]);
  const [nonCompletedLists, setNonCompletedLists] = useState([]);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [listToReject, setListToReject] = useState('');

  const sortLists = lists => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => {
    $.ajax({
      type: 'GET',
      url: `${config.apiBase}/lists/`,
      dataType: 'JSON',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((data, _status, request) => {
      setUserInfo(request);
      const newAcceptedLists = sortLists(data.accepted_lists);
      const newCompletedLists = newAcceptedLists.filter(list => list.completed);
      const newNonCompletedLists = newAcceptedLists.filter(list => !list.completed);
      setUserId(data.current_user_id);
      setPendingLists(sortLists(data.pending_lists)); // this should be sorted the opposite
      setCompletedLists(newCompletedLists);
      setNonCompletedLists(newNonCompletedLists);
    }).fail(({ responseText }) => {
      console.error(JSON.parse(responseText).errors);
      props.history.push('/users/sign_in');
    });
  }, []);

  const handleAlertDismiss = () => {
    setErrors('');
    setSuccess('');
  };

  const handleFormSubmit = (list) => {
    handleAlertDismiss();
    $.ajax({
      url: `${config.apiBase}/lists`,
      type: 'POST',
      data: { list },
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((data, _status, request) => {
        setUserInfo(request);
        const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
        setSuccess('List successfully added.');
      })
      .fail((response) => {
        const responseJSON = JSON.parse(response.responseText);
        const responseTextKeys = Object.keys(responseJSON);
        const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key].join(' and ')}`);
        setErrors(responseErrors.join(' and '));
      });
  };

  const deleteConfirmModalId = 'confirm-delete-completed-list-modal';

  const handleDelete = (list) => {
    setListToDelete(list);
    $(`#${deleteConfirmModalId}`).modal('show');
  };

  const handleDeleteConfirm = () => {
    $(`#${deleteConfirmModalId}`).modal('hide');
    handleAlertDismiss();
    const { id, completed } = listToDelete;
    $.ajax({
      url: `${config.apiBase}/lists/${id}`,
      type: 'DELETE',
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((_data, _status, request) => {
        setUserInfo(request);
        if (completed) {
          const updatedCompletedLists = completedLists.filter(ll => ll.id !== id);
          setCompletedLists(sortLists(updatedCompletedLists));
        } else {
          const updatedNonCompletedLists = nonCompletedLists.filter(ll => ll.id !== id);
          setNonCompletedLists(sortLists(updatedNonCompletedLists));
        }
        setSuccess('List successfully deleted.');
      })
      .fail((response) => {
        const responseJSON = JSON.parse(response.responseText);
        const returnedErrors = Object.keys(responseJSON).map(key => `${key} ${responseJSON[key]}`);
        setErrors(returnedErrors.join(' and '));
      });
  };

  const handleCompletion = (list) => {
    handleAlertDismiss();
    const theList = list;
    theList.completed = true;
    $.ajax({
      url: `${config.apiBase}/lists/${theList.id}`,
      type: 'PUT',
      data: 'list%5Bcompleted%5D=true',
      headers: JSON.parse(sessionStorage.getItem('user')),
      success: (_data, _status, request) => {
        setUserInfo(request);
        const updatedNonCompletedLists = nonCompletedLists.filter(nonList => nonList.id !== theList.id);
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
        const updatedCompletedLists = update(completedLists, { $push: [theList] });
        setCompletedLists(sortLists(updatedCompletedLists));
        setSuccess('List successfully completed.');
      },
    });
  };

  const removeListFromUnaccepted = (listId) => {
    const updatedPendingLists = pendingLists.filter(list => list.id !== listId);
    setPendingLists(updatedPendingLists);
  };

  const acceptList = (list) => {
    handleAlertDismiss();
    $.ajax({
      url: `${config.apiBase}/lists/${list.id}/users_lists/${list.users_list_id}`,
      type: 'PATCH',
      data: 'users_list%5Bhas_accepted%5D=true',
      headers: JSON.parse(sessionStorage.getItem('user')),
      success: (_data, _status, request) => {
        setUserInfo(request);
        const { completed } = list;
        if (completed) {
          const updatedCompletedLists = update(completedLists, { $push: [list] });
          setCompletedLists(sortLists(updatedCompletedLists));
        } else {
          const updatedNonCompletedLists = update(nonCompletedLists, { $push: [list] });
          setNonCompletedLists(sortLists(updatedNonCompletedLists));
        }
        setSuccess('List successfully accepted.');
      },
    });
  };

  const handleAccept = (list) => {
    removeListFromUnaccepted(list.id);
    acceptList(list);
  };

  const rejectConfirmModalId = 'confirm-reject-completed-list-modal';

  const handleReject = (list) => {
    setListToReject(list);
    $(`#${rejectConfirmModalId}`).modal('show');
  };

  const handleRejectConfirm = () => {
    $(`#${rejectConfirmModalId}`).modal('hide');
    handleAlertDismiss();
    $.ajax({
      url: `${config.apiBase}/lists/${listToReject.id}/users_lists/${listToReject.users_list_id}`,
      type: 'PATCH',
      data: 'users_list%5Bhas_accepted%5D=false',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      removeListFromUnaccepted(listToReject.id);
      setSuccess('List successfully rejected.');
    });
  };

  const handleRefresh = (list) => {
    handleAlertDismiss();
    const localList = list;
    localList.refreshed = true;
    $.ajax({
      url: `${config.apiBase}/lists/${list.id}/refresh_list`,
      type: 'POST',
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((data, _status, request) => {
        setUserInfo(request);
        const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
        setSuccess('List successfully refreshed.');
      })
      .fail((response) => {
        const responseJSON = JSON.parse(response.responseText);
        const responseTextKeys = Object.keys(responseJSON);
        const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key].join(' and ')}`);
        setErrors(responseErrors.join(' and '));
      });
  };

  return (
    <div>
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
      />
      <ConfirmModal
        name={deleteConfirmModalId}
        action="delete"
        body="Are you sure you want to delete this list?"
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => $(`#${deleteConfirmModalId}`).modal('hide')}
      />
      <ConfirmModal
        name={rejectConfirmModalId}
        action="reject"
        body="Are you sure you want to reject this list?"
        handleConfirm={() => handleRejectConfirm()}
        handleClear={() => $(`#${rejectConfirmModalId}`).modal('hide')}
      />
    </div>
  );
}
