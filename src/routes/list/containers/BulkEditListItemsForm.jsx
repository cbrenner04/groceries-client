import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import { list, listItem, listUsers } from '../../../types';
import { formatDueBy } from '../../../utils/format';
import axios from '../../../utils/api';
import { itemName } from '../utils';
import BulkEditListItemsFormFields from '../components/BulkEditListItemsFormFields';
import FormSubmission from '../../../components/FormSubmission';

function BulkEditListItemsForm(props) {
  // if no existing list options, new list form should be displayed by default
  const existingListsOptions = props.lists.map((list) => ({ value: String(list.id), label: list.name }));

  // attributes that makes sense to updated on all items are included
  // set attributes to initial value if all items have the same value for the attribute
  // the value of these attributes can be cleared for all items with their respective clear state attributes
  // read, purchased, completed not included as they add complexity and they can be updated in bulk on the list itself
  const initialAttr = (attribute) => {
    const uniqValues = [...new Set(props.items.map(({ [attribute]: value }) => value))];
    return uniqValues.length === 1 && uniqValues[0] ? uniqValues[0] : '';
  };
  const initialValues = {
    copy: false,
    move: false,
    existingList: '',
    newListName: '',
    updateCurrentItems: false,
    album: initialAttr('album'),
    clearAlbum: false,
    artist: initialAttr('artist'),
    clearArtist: false,
    assigneeId: String(initialAttr('assignee_id')),
    clearAssignee: false,
    author: initialAttr('author'),
    clearAuthor: false,
    category: initialAttr('category'),
    clearCategory: false,
    dueBy: formatDueBy(initialAttr('due_by')),
    clearDueBy: false,
    quantity: initialAttr('quantity'),
    clearQuantity: false,
    showNewListForm: !existingListsOptions.length,
    allComplete: initialAttr('purchased') || initialAttr('completed') || false,
  };

  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // must have existing list or new list identified to copy or move
    if ((formData.copy || formData.move) && !formData.existingList && !formData.newListName) {
      toast(`You must specify a list to ${formData.copy ? 'copy' : 'move'} items`, { type: 'error' });
      return;
    }
    const putData = {
      category: formData.category || null,
      author: formData.author || null,
      quantity: formData.quantity || null,
      artist: formData.artist || null,
      album: formData.album || null,
      assignee_id: formData.assigneeId || null,
      due_by: formData.dueBy || null,
      clear_category: formData.clearCategory,
      clear_author: formData.clearAuthor,
      clear_quantity: formData.clearQuantity,
      clear_artist: formData.clearArtist,
      clear_album: formData.clearAlbum,
      clear_assignee: formData.clearAssignee,
      clear_due_by: formData.clearDueBy,
      // if copying, the user will set whether or not to update current items
      // if moving, the current items will not be updated
      // if not doing either, updating the current items is the only action being take
      update_current_items: formData.copy ? formData.updateCurrentItems : !formData.move,
    };
    if (formData.copy) {
      putData.copy = formData.copy;
    }
    if (formData.move) {
      putData.move = formData.move;
    }
    if (formData.existingList) {
      putData.existing_list_id = formData.existingList;
    }
    if (formData.newListName) {
      putData.new_list_name = formData.newListName;
    }
    const itemIds = props.items.map(({ id }) => id).join(',');
    try {
      await axios.put(`/lists/${props.list.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        list_items: putData,
      });
      toast('Items successfully updated', { type: 'info' });
      props.navigate(`/lists/${props.list.id}`);
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('Some items not found', { type: 'error' });
          props.navigate(`/lists/${props.list.id}`);
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map((key) => `${key} ${response.data[key]}`);
          let joinString;
          if (props.list.type === 'BookList' || props.list.type === 'MusicList') {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          toast(responseErrors.join(joinString), { type: 'error' });
        }
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
      }
    }
  };

  const clearNewListForm = () => {
    const updatedFormData = update(formData, {
      newListName: { $set: '' },
      showNewListForm: { $set: initialValues.showNewListForm },
    });
    setFormData(updatedFormData);
  };

  const handleOtherListChange = (isCopy) => {
    const [action, oppositeAction] = isCopy ? ['copy', 'move'] : ['move', 'copy'];
    const updates = {};
    if (!formData[action] && formData[oppositeAction]) {
      updates[oppositeAction] = { $set: false };
    }
    if (formData[action]) {
      updates.showNewListForm = { $set: initialValues.showNewListForm };
      updates.newListName = { $set: '' };
      updates.existingList = { $set: '' };
    }
    updates[action] = { $set: !formData[action] };
    const updatedFormData = update(formData, updates);
    setFormData(updatedFormData);
  };

  const handleInput = ({ target: { name, value, checked } }) => {
    let newValue = value;
    if (name === 'updateCurrentItems') {
      newValue = checked;
    }
    const updatedFormData = update(formData, { [name]: { $set: newValue } });
    setFormData(updatedFormData);
  };

  const clearAttribute = (attribute, clearAttribute) => {
    const updates = {};
    if (!formData[clearAttribute] && formData[attribute]) {
      updates[attribute] = { $set: '' };
    }
    if (formData[clearAttribute]) {
      updates[attribute] = { $set: initialValues[attribute] };
    }
    updates[clearAttribute] = { $set: !formData[clearAttribute] };
    const updatedFormData = update(formData, updates);
    setFormData(updatedFormData);
  };

  const handleShowNewListForm = () => {
    const updatedFormData = update(formData, {
      existingList: { $set: '' },
      showNewListForm: { $set: true },
    });
    setFormData(updatedFormData);
  };

  return (
    <>
      <h1>Edit {props.items.map((item) => itemName(item, props.list.type)).join(', ')}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          formData={formData}
          handleInput={handleInput}
          clearAttribute={clearAttribute}
          listUsers={props.listUsers}
          listType={props.list.type}
          handleOtherListChange={handleOtherListChange}
          existingListsOptions={existingListsOptions}
          handleShowNewListForm={handleShowNewListForm}
          clearNewListForm={clearNewListForm}
          categories={props.categories}
        />
        <FormSubmission
          submitText="Update Items"
          cancelAction={() => props.navigate(`/lists/${props.list.id}`)}
          cancelText="Cancel"
        />
      </Form>
    </>
  );
}

BulkEditListItemsForm.propTypes = {
  navigate: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(listItem).isRequired,
  list: list.isRequired,
  lists: PropTypes.arrayOf(list).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  listUsers: PropTypes.arrayOf(listUsers),
};

BulkEditListItemsForm.defaultProps = {
  listUsers: [],
};

export default BulkEditListItemsForm;
