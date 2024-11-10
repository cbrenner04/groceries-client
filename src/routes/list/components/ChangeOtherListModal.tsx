import React, { useState, type ChangeEventHandler, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { SelectField, TextField } from 'components/FormFields';
import { prettyListType } from 'utils/format';
import type { IList, IListItem } from 'typings';
import FormSubmission from 'components/FormSubmission';
import axios from 'utils/api';

export interface IChangeOtherListModalProps {
  copy: boolean;
  move: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  currentList: IList;
  lists: IList[];
  items: IListItem[];
  setSelectedItems: Dispatch<SetStateAction<IListItem[]>>;
  setIncompleteMultiSelect: Dispatch<SetStateAction<boolean>>;
  setCompleteMultiSelect: Dispatch<SetStateAction<boolean>>;
}

const ChangeOtherList: React.FC<IChangeOtherListModalProps> = (props): React.JSX.Element => {
  const existingListsOptions = props.lists.map((list) => ({ value: String(list.id), label: list.name }));
  const changeListInstructions = existingListsOptions.length
    ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      `Choose an existing list or create a new one to ${(props.copy && 'copy') || (props.move && 'move')} items`
    : `You do not have any other ${prettyListType(
        props.currentList.type,
      )}s. Please create a new list to take this action.`;
  const [showNewListForm, setShowNewListForm] = useState(!existingListsOptions.length);
  const [newListName, setNewListName] = useState(undefined as string | undefined);
  const [existingList, setExistingList] = useState(undefined as string | undefined);

  const handleNewListNameInput: ChangeEventHandler<HTMLInputElement> = (element): void => {
    setNewListName(element.target.value);
  };

  const handleExistingListSelect: ChangeEventHandler<HTMLInputElement> = (element): void => {
    setExistingList(element.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const itemIds = props.items.map((item) => item.id).join(',');
    const putData = {
      existing_list_id: existingList,
      new_list_name: newListName,
      move: props.move,
      copy: props.copy,
    };
    // TODO: need to separate this functionality out from bulk updates
    await axios.put(`/lists/${props.currentList.id}/list_items/bulk_update?item_ids=${itemIds}`, {
      list_items: putData,
    });
    props.setShow(false);
    props.setSelectedItems([]);
    props.setCompleteMultiSelect(false);
    props.setIncompleteMultiSelect(false);
    toast('Items successfully updated', { type: 'info' });
  };

  return (
    <Modal show={props.show} onHide={(): void => props.setShow(false)}>
      <Modal.Header closeButton>{changeListInstructions}</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} autoComplete="off">
          {showNewListForm && existingListsOptions.length > 0 && (
            <Button
              variant="link"
              onClick={(): void => setShowNewListForm(false)}
              className="float-end"
              style={{ padding: '0' }}
            >
              Choose existing list
            </Button>
          )}
          {!showNewListForm && (
            <Button
              variant="link"
              onClick={(): void => setShowNewListForm(true)}
              className="float-end"
              style={{ padding: '0' }}
            >
              Create new list
            </Button>
          )}
          {!showNewListForm && existingListsOptions.length > 0 && (
            <SelectField
              name="existingList"
              label="Existing list"
              value={existingList}
              options={existingListsOptions}
              handleChange={handleExistingListSelect}
              blankOption
            />
          )}
          {showNewListForm && (
            <TextField
              name="newListName"
              label="New list name"
              value={newListName ?? ''}
              handleChange={handleNewListNameInput}
              placeholder="My super cool list"
            />
          )}
          <ButtonGroup>
            <FormSubmission
              submitText="Complete"
              cancelAction={(): void => props.setShow(false)}
              cancelText="Cancel"
              noGrid={true}
            />
          </ButtonGroup>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeOtherList;
