import React, { useState, type ChangeEventHandler, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { ButtonGroup, Form, Modal } from 'react-bootstrap';
import { type AxiosError } from 'axios';

import { showToast } from '../../../utils/toast';
import { BottomSheet } from 'components/ui/BottomSheet';

import { SelectField, TextField } from 'components/FormFields';
import type { IList, IListItem } from 'typings';
import FormSubmission from 'components/FormSubmission';
import axios from 'utils/api';

export interface IChangeOtherListModalProps {
  copy: boolean;
  move: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean | null>> | (() => void);
  currentList: IList;
  lists: IList[];
  items: IListItem[];
  setSelectedItems: Dispatch<SetStateAction<IListItem[]>>;
  setIncompleteMultiSelect: Dispatch<SetStateAction<boolean>>;
  setCompleteMultiSelect: Dispatch<SetStateAction<boolean>>;
  handleMove: () => void;
  useBottomSheet?: boolean;
}

const ChangeOtherList: React.FC<IChangeOtherListModalProps> = (props): React.JSX.Element => {
  const existingListsOptions = props.lists.map((list) => ({ value: String(list.id), label: list.name }));
  const changeListInstructions = existingListsOptions.length
    ? `Choose an existing list or create a new one to ${props.copy ? 'copy' : 'move'} items`
    : `You do not have any other lists with the same configuration. Please create a new list to take this action.`;
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

    // Validate that either an existing list is selected or a new list name is provided
    if (!existingList && !newListName) {
      showToast.error('Please select an existing list or enter a new list name');
      return;
    }

    const itemIds = props.items.map((item) => item.id).join(',');
    const putData = {
      existing_list_id: existingList,
      new_list_name: newListName,
      move: props.move,
      copy: props.copy,
    };

    try {
      // Use V2 API endpoint for bulk updates
      await axios.put(`/lists/${props.currentList.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        list_items: putData,
      });
      props.setShow(false);
      props.setSelectedItems([]);
      props.setCompleteMultiSelect(false);
      props.setIncompleteMultiSelect(false);
      props.handleMove();
      showToast.info('Items successfully updated');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        if (axiosError.response.status === 401) {
          showToast.error('You must sign in');
        } else if (axiosError.response.status === 404) {
          showToast.error('One or more items were not found');
        } else if (axiosError.response.status === 403) {
          showToast.error('You do not have permission to perform this action');
        } else {
          showToast.error('Failed to update items. Please try again.');
        }
      } else if (axiosError.request) {
        showToast.error('Network error. Please check your connection.');
      } else {
        showToast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const switchToExisting = (
    <button
      type="button"
      onClick={(): void => setShowNewListForm(false)}
      className="tw:text-sm tw:text-[var(--color-primary)] tw:font-medium tw:underline tw:mb-3"
      data-test-id="choose-existing-list-link"
    >
      Choose existing list
    </button>
  );

  const switchToNew = (
    <button
      type="button"
      onClick={(): void => setShowNewListForm(true)}
      className="tw:text-sm tw:text-[var(--color-primary)] tw:font-medium tw:underline tw:mb-3"
      data-test-id="create-new-list-link"
    >
      Create new list
    </button>
  );

  const existingListSelect = (
    <SelectField
      name="existingList"
      label="Existing list"
      value={existingList}
      options={existingListsOptions}
      handleChange={handleExistingListSelect}
      blankOption
    />
  );

  const newListNameInput = (
    <TextField
      name="newListName"
      label="New list name"
      value={newListName ?? ''}
      handleChange={handleNewListNameInput}
      placeholder="My super cool list"
    />
  );

  const submit = (
    <FormSubmission
      submitText="Complete"
      cancelAction={(): void => {
        if (typeof props.setShow === 'function') {
          props.setShow(false);
        }
      }}
      cancelText="Cancel"
    />
  );

  if (props.useBottomSheet) {
    return (
      <BottomSheet
        isOpen={props.show}
        onClose={(): void => {
          if (typeof props.setShow === 'function') {
            props.setShow(false);
          }
        }}
        title={props.copy ? 'Copy to List' : 'Move to List'}
        testId="change-other-list-sheet"
      >
        <div className="tw:mb-3 tw:text-sm tw:text-[var(--color-text-secondary)]">{changeListInstructions}</div>
        <Form onSubmit={handleSubmit} autoComplete="off">
          {showNewListForm && existingListsOptions.length > 0 && switchToExisting}
          {showNewListForm && newListNameInput}

          {!showNewListForm && switchToNew}
          {!showNewListForm && existingListsOptions.length > 0 && existingListSelect}

          {submit}
        </Form>
      </BottomSheet>
    );
  }

  return (
    <Modal show={props.show} onHide={(): void => props.setShow(false)} data-test-id="change-other-list-modal">
      <Modal.Header closeButton>{changeListInstructions}</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} autoComplete="off">
          {showNewListForm && existingListsOptions.length > 0 && switchToExisting}
          {showNewListForm && newListNameInput}

          {!showNewListForm && switchToNew}
          {!showNewListForm && existingListsOptions.length > 0 && existingListSelect}

          <ButtonGroup>{submit}</ButtonGroup>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeOtherList;
