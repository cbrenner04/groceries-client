import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import List from './List';

const Lists = props => (
  <div>
    { props.pendingLists.length > 0 &&
      (
        <div>
          <p>These lists have been shared with you but you have not accepted the invitation.</p>
          <div className="list-group">
            {
              props.pendingLists.map(list => (
                <List
                  userId={props.userId}
                  list={list}
                  key={list.id}
                  onListAcceptance={props.onAccept}
                  onListRejection={props.onReject}
                />
              ))
            }
          </div>
          <hr />
        </div>
      )
    }
    <h1>Your Lists</h1>
    <p>
      These are lists you&apos;ve created or you&apos;ve accepted an
      invitation from someone else.
    </p>
    <div className="list-group">
      {
        props.nonCompletedLists.map(list => (
          <List
            userId={props.userId}
            list={list}
            key={list.id}
            onListDeletion={props.onListDelete}
            onListCompletion={props.onListCompletion}
            completed={list.completed}
            accepted
          />
        ))
      }
    </div>
    <br />
    <h2>Completed Lists</h2>
    <p>
      These are the completed lists most recently created.&nbsp;
      <Link to="/completed_lists">See all completed lists here.</Link>&nbsp;
      Previously refreshed lists are marked with an asterisk (*).
    </p>
    <div className="list-group">
      {
        props.completedLists.map(list => (
          <List
            userId={props.userId}
            list={list}
            key={list.id}
            onListDeletion={props.onListDelete}
            completed={list.completed}
            onListRefresh={props.onListRefresh}
            accepted
          />
        ))
      }
    </div>
  </div>
);

Lists.propTypes = {
  userId: PropTypes.number.isRequired,
  completedLists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired).isRequired,
  nonCompletedLists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired).isRequired,
  pendingLists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDelete: PropTypes.func.isRequired,
  onListRefresh: PropTypes.func.isRequired,
};

export default Lists;
