import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import List from './components/List';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';

function CompletedLists(props) {
  const [completedLists, setCompletedLists] = useState([]);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');

  useEffect(() => {
    $.ajax({
      type: 'GET',
      url: `${config.apiBase}/completed_lists/`,
      dataType: 'JSON',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((data, _status, request) => {
      setUserInfo(request);
      setCompletedLists(data.completed_lists);
    }).fail(({ responseText }) => {
      console.error(JSON.parse(responseText).errors);
      props.history.push('/users/sign_in');
    });
  }, []);

  const dismissAlert = () => {
    setSuccess('');
    setErrors('');
  };

  const handleRefresh = (list) => {
    dismissAlert();
    $.ajax({
      url: `${config.apiBase}/lists/${list.id}/refresh_list`,
      type: 'POST',
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((_data, _status, request) => {
        setUserInfo(request);
        const refreshedList = completedLists.find(completedList => completedList.id === list.id);
        refreshedList.refreshed = true;
        setSuccess('Your list was successfully refreshed.');
      })
      .fail((response) => {
        const responseJSON = JSON.parse(response.responseText);
        const returnedErrors = Object.keys(responseJSON).map(key => `${key} ${responseJSON[key]}`);
        setErrors(returnedErrors.join(' and '));
      });
  };

  const confirmModalId = 'confirm-delete-completed-list-modal';

  const handleDelete = (list) => {
    setListToDelete(list);
    $(`#${confirmModalId}`).modal('show');
  };

  const handleDeleteConfirm = () => {
    dismissAlert();
    $(`#${confirmModalId}`).modal('hide');
    $.ajax({
      url: `${config.apiBase}/lists/${listToDelete.id}`,
      type: 'DELETE',
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((_data, _status, request) => {
        setUserInfo(request);
        const lists = completedLists.filter(cl => cl.id !== listToDelete.id);
        setCompletedLists(lists);
        setSuccess('Your list was successfully deleted.');
      })
      .fail((response) => {
        const responseJSON = JSON.parse(response.responseText);
        const returnedErrors = Object.keys(responseJSON).map(key => `${key} ${responseJSON[key]}`);
        setErrors(returnedErrors.join(' and '));
      });
  };

  return (
    <div>
      <h1>Completed Lists</h1>
      <Alert errors={errors} success={success} handleDismiss={dismissAlert} />
      <div className="clearfix">
        <Link to="/lists" className="float-right">Back to lists</Link>
        <div className="float-left">Previously refreshed lists are marked with an asterisk (*).</div>
      </div>
      <div className="list-group">
        {
          completedLists.map(list => (
            <List
              userId={list.user_id}
              list={list}
              key={list.id}
              onListDeletion={handleDelete}
              completed={list.completed}
              onListRefresh={handleRefresh}
              accepted
            />
          ))
        }
      </div>
      <ConfirmModal
        name={confirmModalId}
        action="delete"
        body="Are you sure you want to delete this list?"
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => $(`#${confirmModalId}`).modal('hide')}
      />
    </div>
  );
}

export default CompletedLists;
