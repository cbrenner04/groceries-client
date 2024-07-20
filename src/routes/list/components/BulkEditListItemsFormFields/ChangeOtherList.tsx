import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { CheckboxField, SelectField, TextField } from '../../../../components/FormFields';
import { prettyListType } from '../../../../utils/format';

const ChangeOtherList = (props) => {
  const handleMove = () => {
    props.handleOtherListChange(false);
  };

  const handleCopy = () => {
    props.handleOtherListChange(true);
  };

  const changeListInstructions = props.existingListsOptions.length
    ? 'Choose an existing list or create a new one.'
    : `You do not have any other ${prettyListType(props.listType)}s. Please create a new list to take this action.`;

  return (
    <>
      <Form.Group className="form-check-inline mb-3">
        <Form.Check
          name="copy"
          label="Copy"
          type="radio"
          onChange={handleCopy}
          onClick={handleCopy}
          value={props.copy}
          id="move-action-copy"
          checked={props.copy}
        />
        <Form.Check
          name="move"
          label="Move"
          type="radio"
          value={props.move}
          id="move-action-move"
          onChange={handleMove}
          onClick={handleMove}
          checked={props.move}
        />
      </Form.Group>
      {(props.copy || props.move) && (
        <>
          <div className="mb-3">{changeListInstructions}</div>
          {props.showNewListForm && props.existingListsOptions.length > 0 && (
            <Button variant="link" onClick={props.clearNewListForm} className="mb-3">
              Choose existing list
            </Button>
          )}
          {!props.showNewListForm && (
            <>
              <Button variant="link" onClick={props.handleShowNewListForm} className="mb-3">
                Create new list
              </Button>
              <SelectField
                name="existingList"
                label="Existing list"
                value={props.existingList}
                options={props.existingListsOptions}
                handleChange={props.handleInput}
                blankOption
              />
            </>
          )}
          {props.showNewListForm && (
            <TextField
              name="newListName"
              label="New list name"
              value={props.newListName}
              handleChange={props.handleInput}
              placeholder="My super cool list"
            />
          )}
          {props.copy && !props.allComplete && (
            <CheckboxField
              name="updateCurrentItems"
              label="Would you like to also update the current items?"
              handleChange={props.handleInput}
              value={props.updateCurrentItems}
              classes="mt-3"
            />
          )}
        </>
      )}
    </>
  );
};

ChangeOtherList.propTypes = {
  handleOtherListChange: PropTypes.func.isRequired,
  copy: PropTypes.bool.isRequired,
  move: PropTypes.bool.isRequired,
  showNewListForm: PropTypes.bool.isRequired,
  existingListsOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  listType: PropTypes.string.isRequired,
  handleInput: PropTypes.func.isRequired,
  handleShowNewListForm: PropTypes.func.isRequired,
  clearNewListForm: PropTypes.func.isRequired,
  existingList: PropTypes.string.isRequired,
  newListName: PropTypes.string.isRequired,
  updateCurrentItems: PropTypes.bool.isRequired,
  allComplete: PropTypes.bool.isRequired,
};

export default ChangeOtherList;
