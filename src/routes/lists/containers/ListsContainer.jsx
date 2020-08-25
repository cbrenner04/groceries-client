import React, { useContext, useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import ListForm from '../components/ListForm';
import axios from '../../../utils/api';
import { sortLists, failure } from '../utils';
import PendingLists from '../components/PendingLists';
import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';
import { list } from '../../../types';
import { UserContext } from '../../../context/UserContext';
import { ActionCableContextConsumer } from '../../../context/ActionCableContext';

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [pending, setPending] = useState(false);
  const { user } = useContext(UserContext);

  const handleFormSubmit = async (list) => {
    setPending(true);
    try {
      const { data } = await axios.post(`/lists`, { list });
      // must update currentUserPermissions prior to incompleteLists
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      const updatedIncompleteLists = update(incompleteLists, { $push: [data] });
      setIncompleteLists(sortLists(updatedIncompleteLists));
      setPending(false);
      toast('List successfully added.', { type: 'info' });
    } catch (error) {
      failure(error, props.history, setPending);
    }
  };

  const handleReceivedData = (data) => {
    const {
      accepted_lists: { completed_lists, not_completed_lists },
      pending_lists,
      current_list_permissions,
    } = data;
    setCompletedLists(completed_lists);
    setIncompleteLists(not_completed_lists);
    setPendingLists(pending_lists);
    setCurrentUserPermissions(current_list_permissions);
  };

  return (
    <ActionCableContextConsumer channel="ListsChannel" onReceived={handleReceivedData} user={user}>
      <h1>Lists</h1>
      <ListForm onFormSubmit={handleFormSubmit} pending={pending} />
      <hr className="mb-4" />
      {pendingLists.length > 0 && ( // cannot just check length as it will render 0
        <PendingLists
          history={props.history}
          userId={props.userId}
          currentUserPermissions={currentUserPermissions}
          pendingLists={pendingLists}
          setPendingLists={setPendingLists}
          completedLists={completedLists}
          setCompletedLists={setCompletedLists}
          incompleteLists={incompleteLists}
          setIncompleteLists={setIncompleteLists}
        />
      )}
      <AcceptedLists
        title={
          <TitlePopover
            title="Incomplete"
            message="These are lists you've created or you've accepted an invitation from someone else."
          />
        }
        completed={false}
        fullList={false}
        history={props.history}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
      />
      <AcceptedLists
        title={
          <TitlePopover
            title="Completed"
            message={
              <>
                These are the completed lists most recently created.&nbsp;
                <Link to="/completed_lists">See all completed lists here.</Link>&nbsp; Previously refreshed lists are
                marked with an asterisk (*).
              </>
            }
          />
        }
        completed={true}
        fullList={false}
        history={props.history}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
      />
    </ActionCableContextConsumer>
  );
}

ListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  pendingLists: PropTypes.arrayOf(list).isRequired,
  completedLists: PropTypes.arrayOf(list).isRequired,
  incompleteLists: PropTypes.arrayOf(list).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ListsContainer;
