import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

function ListsWrapper(props) {
  return (
    <div className="mb-4">
      <div className="clearfix">
        <div className="mx-auto float-left">{props.title}</div>
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
      {props.children}
    </div>
  );
}

ListsWrapper.propTypes = {
  title: PropTypes.element.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  setSelectedLists: PropTypes.func.isRequired,
  setMultiSelect: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default ListsWrapper;
