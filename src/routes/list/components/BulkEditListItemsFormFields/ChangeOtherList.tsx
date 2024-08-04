import React, { type ChangeEventHandler } from 'react';
import { Button, Form } from 'react-bootstrap';

import { CheckboxField, SelectField, TextField } from 'components/FormFields';
import { prettyListType } from 'utils/format';

export interface IChangeOtherListProps {
  handleOtherListChange: (isCopy: boolean) => void;
  copy: boolean;
  move: boolean;
  showNewListForm: boolean;
  existingListsOptions: {
    value: string;
    label: string;
  }[];
  listType: string;
  handleInput: ChangeEventHandler;
  handleShowNewListForm: () => void;
  clearNewListForm: () => void;
  existingList: string;
  newListName: string;
  updateCurrentItems: boolean;
  allComplete: boolean;
}

const ChangeOtherList: React.FC<IChangeOtherListProps> = (props): React.JSX.Element => {
  const handleMove = (): void => {
    props.handleOtherListChange(false);
  };

  const handleCopy = (): void => {
    props.handleOtherListChange(true);
  };

  const changeListInstructions = props.existingListsOptions.length
    ? 'Choose an existing list or create a new one.'
    : `You do not have any other ${prettyListType(props.listType)}s. Please create a new list to take this action.`;

  return (
    <React.Fragment>
      <Form.Group className="form-check-inline mb-3">
        <Form.Check
          name="copy"
          label="Copy"
          type="radio"
          onChange={handleCopy}
          onClick={handleCopy}
          value={String(props.copy)}
          id="move-action-copy"
          checked={props.copy}
        />
        <Form.Check
          name="move"
          label="Move"
          type="radio"
          value={String(props.move)}
          id="move-action-move"
          onChange={handleMove}
          onClick={handleMove}
          checked={props.move}
        />
      </Form.Group>
      {(props.copy || props.move) && (
        <React.Fragment>
          <div className="mb-3">{changeListInstructions}</div>
          {props.showNewListForm && props.existingListsOptions.length > 0 && (
            <Button variant="link" onClick={props.clearNewListForm} className="mb-3">
              Choose existing list
            </Button>
          )}
          {!props.showNewListForm && (
            <React.Fragment>
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
            </React.Fragment>
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
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ChangeOtherList;
