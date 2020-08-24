import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import { list } from '../../../types';

function Lists(props) {
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

Lists.propTypes = {
  title: PropTypes.element.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(list).isRequired,
  setSelectedLists: PropTypes.func.isRequired,
  setMultiSelect: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default Lists;
