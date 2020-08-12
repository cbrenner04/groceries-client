import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, ListGroup } from 'react-bootstrap';

import List from './List';
import TitlePopover from '../../../components/TitlePopover';

const Lists = (props) => (
  <>
    {props.pendingLists.length > 0 && ( // cannot just check length as it will render 0
      <div className="mb-4">
        <div className="clearfix">
          <div className="mx-auto float-left">
            <TitlePopover
              title="Pending"
              message="These lists have been shared with you but you have not accepted the invitation."
            />
          </div>
          {/* <Button
            variant="link"
            className="mx-auto float-right"
            onClick={() => {
              if (props.multiSelect && props.selectedLists.length > 0) {
                props.setSelectedLists([]);
              }
              props.setMultiSelect(!props.multiSelect);
            }}
          >
            {props.multiSelect ? 'Hide' : ''} Select
          </Button> */}
        </div>
        <ListGroup>
          {props.pendingLists.map((list) => (
            <List
              userId={props.userId}
              list={list}
              key={list.id}
              onListAcceptance={props.onAccept}
              onListRejection={props.onReject}
              currentUserPermissions={props.currentUserPermissions[list.id]}
            />
          ))}
        </ListGroup>
      </div>
    )}
    <div className="mb-4">
      <div className="clearfix">
        <div className="mx-auto float-left">
          <TitlePopover
            title="Incomplete"
            message="These are lists you've created or you've accepted an invitation from someone else."
          />
        </div>
        <Button
          variant="link"
          className="mx-auto float-right"
          onClick={() => {
            if (props.multiSelect && props.selectedLists.length > 0) {
              props.setSelectedLists([]);
            }
            props.setMultiSelect(!props.multiSelect);
          }}
        >
          {props.multiSelect ? 'Hide' : ''} Select
        </Button>
      </div>
      <ListGroup>
        {props.nonCompletedLists.map((list) => (
          <List
            userId={props.userId}
            list={list}
            key={list.id}
            onListDeletion={props.onListDelete}
            onListCompletion={props.onListCompletion}
            completed={list.completed}
            currentUserPermissions={props.currentUserPermissions[list.id]}
            multiSelect={props.multiSelect}
            selectedLists={props.selectedLists}
            setSelectedLists={props.setSelectedLists}
            handleMerge={props.handleMerge}
            accepted
          />
        ))}
      </ListGroup>
    </div>
    <div className="mb-4">
      <div className="clearfix">
        <div className="mx-auto float-left">
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
        </div>
        {/* <Button
          variant="link"
          className="mx-auto float-right"
          onClick={() => {
            if (props.multiSelect && props.selectedLists.length > 0) {
              props.setSelectedLists([]);
            }
            props.setMultiSelect(!props.multiSelect);
          }}
        >
          {props.multiSelect ? 'Hide' : ''} Select
        </Button> */}
      </div>
      <ListGroup>
        {props.completedLists.map((list) => (
          <List
            userId={props.userId}
            list={list}
            key={list.id}
            onListDeletion={props.onListDelete}
            completed={list.completed}
            onListRefresh={props.onListRefresh}
            currentUserPermissions={props.currentUserPermissions[list.id]}
            multiSelect={props.multiSelect}
            selectedLists={props.selectedLists}
            setSelectedLists={props.setSelectedLists}
            handleMerge={props.handleMerge}
            accepted
          />
        ))}
      </ListGroup>
    </div>
  </>
);

Lists.propTypes = {
  userId: PropTypes.number.isRequired,
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  nonCompletedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  pendingLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDelete: PropTypes.func.isRequired,
  onListRefresh: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
  multiSelect: PropTypes.bool.isRequired,
  setMultiSelect: PropTypes.func.isRequired,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  setSelectedLists: PropTypes.func.isRequired,
  handleMerge: PropTypes.func.isRequired,
};

export default Lists;
