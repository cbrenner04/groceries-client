import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import { formatDueBy, listTypeToSnakeCase } from '../../../utils/format';
import axios from '../../../utils/api';
import { itemName } from '../utils';
import BulkEditListItemsFormFields from '../components/BulkEditListItemsFormFields';

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
    const urlListType = listTypeToSnakeCase(props.list.type);
    const itemIds = props.items.map(({ id }) => id).join(',');
    try {
      await axios.put(`/lists/${props.list.id}/${urlListType}_items/bulk_update?item_ids=${itemIds}`, {
        [`${urlListType}_items`]: putData,
      });
      toast('Items successfully updated', { type: 'info' });
      props.history.push(`/lists/${props.list.id}`);
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.history.push('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('Some items not found', { type: 'error' });
          props.history.push(`/lists/${props.list.id}`);
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
        <Button type="submit" variant="success" block>
          Update Items
        </Button>
        <Button href={`/lists/${props.list.id}`} variant="link" block>
          Cancel
        </Button>
      </Form>
    </>
  );
}

BulkEditListItemsForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      product: PropTypes.string,
      task: PropTypes.string,
      purchased: PropTypes.bool,
      quantity: PropTypes.string,
      completed: PropTypes.bool,
      author: PropTypes.string,
      title: PropTypes.string,
      read: PropTypes.bool,
      artist: PropTypes.string,
      dueBy: PropTypes.string,
      assigneeId: PropTypes.string,
      album: PropTypes.string,
      numberInSeries: PropTypes.number,
      category: PropTypes.string,
    }),
  ).isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  lists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  ),
};

BulkEditListItemsForm.defaultProps = {
  listUsers: [],
};

export default BulkEditListItemsForm;
