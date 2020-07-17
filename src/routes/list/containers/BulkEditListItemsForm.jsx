import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { formatDueBy, listTypeToSnakeCase } from '../../../utils/format';
import axios from '../../../utils/api';
import { itemName } from '../utils';
import { CategoryField, CheckboxField, DateField, SelectField, TextField } from '../../../components/FormFields';

function BulkEditListItemsForm(props) {
  // if no existing list options, new list form should be displayed by default
  const existingListsOptions = props.lists.map((list) => ({ value: String(list.id), label: list.name }));
  // copy or move to new/existing list
  const [copy, setCopy] = useState(false);
  const [move, setMove] = useState(false);
  const [showNewListForm, setShowNewListForm] = useState(!existingListsOptions.length);
  const [newListName, setNewListName] = useState('');
  const [existingList, setExistingList] = useState('');
  const [updateCurrentItems, setUpdateCurrentItems] = useState(false);

  // set attributes to initial value if all items have the same value for the attribute
  const initialAttr = (attribute) => {
    const uniqValues = [...new Set(props.items.map(({ [attribute]: value }) => value))];
    return uniqValues.length === 1 && uniqValues[0] ? uniqValues[0] : '';
  };
  const initialCategory = initialAttr('category');
  const initialAuthor = initialAttr('author');
  const initialQuantity = initialAttr('quantity');
  const initialArtist = initialAttr('artist');
  const initialAlbum = initialAttr('album');
  const initialAssigneeId = String(initialAttr('assignee_id'));
  const initialDueBy = formatDueBy(initialAttr('due_by'));

  // clear any attributes on all items
  const [clearCategory, setClearCategory] = useState(false);
  const [clearQuantity, setClearQuantity] = useState(false);
  const [clearAuthor, setClearAuthor] = useState(false);
  const [clearArtist, setClearArtist] = useState(false);
  const [clearAlbum, setClearAlbum] = useState(false);
  const [clearAssignee, setClearAssignee] = useState(false);
  const [clearDueBy, setClearDueBy] = useState(false);

  // attributes that makes sense to updated on all items. can be cleared with above clear state attributes
  // read, purchased, completed not included as they add complexity and they can be updated in bulk on the list itself
  const [category, setCategory] = useState(initialCategory);
  const [author, setAuthor] = useState(initialAuthor);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [artist, setArtist] = useState(initialArtist);
  const [album, setAlbum] = useState(initialAlbum);
  const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
  const [dueBy, setDueBy] = useState(initialDueBy);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const putData = {
      category: category || null,
      author,
      quantity,
      artist,
      album,
      assignee_id: assigneeId || null,
      due_by: dueBy || null,
      clear_category: clearCategory,
      clear_author: clearAuthor,
      clear_quantity: clearQuantity,
      clear_artist: clearArtist,
      clear_album: clearAlbum,
      clear_assignee: clearAssignee,
      clear_due_by: clearDueBy,
      // if copying, the user will set whether or not to update current items
      // if moving, the current items will not be updated
      // if not doing either, updating the current items is the only action being take
      update_current_items: copy ? updateCurrentItems : !move,
    };
    if (copy) {
      putData.copy = copy;
    }
    if (move) {
      putData.move = move;
    }
    if (existingList) {
      putData.existing_list_id = existingList;
    }
    if (newListName) {
      putData.new_list_name = newListName;
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
    setShowNewListForm(false);
    setNewListName('');
  };

  const handleMove = () => {
    if (!move && copy) {
      setCopy(false);
    }
    if (move) {
      clearNewListForm();
      setExistingList('');
    }
    setMove(!move);
  };

  const handleCopy = () => {
    if (!copy && move) {
      setMove(false);
    }
    if (copy) {
      clearNewListForm();
      setExistingList('');
    }
    setCopy(!copy);
  };

  const changeListInstructions = existingListsOptions.length
    ? 'Choose an existing list or create a new one.'
    : `You do not have any other ${props.list.type}s. Please create a new list to take this action.`;

  return (
    <>
      <h1>Edit {props.items.map((item) => itemName(item, props.list.type)).join(', ')}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <div>Move or copy these items to another list.</div>
        <br />
        <Form.Group className="form-check-inline">
          <Form.Check
            name="copy"
            label="Copy"
            type="radio"
            onChange={handleCopy}
            onClick={handleCopy}
            value={copy}
            id="move-action-copy"
            checked={copy}
          />
          <Form.Check
            name="move"
            label="Move"
            type="radio"
            value={move}
            id="move-action-move"
            onChange={handleMove}
            onClick={handleMove}
            checked={move}
          />
        </Form.Group>
        {(copy || move) && (
          <>
            <div className="mb-3">{changeListInstructions}</div>
            {showNewListForm && existingListsOptions.length > 0 && (
              <Button variant="link" onClick={clearNewListForm} className="mb-3">
                Choose existing list
              </Button>
            )}
            {!showNewListForm && (
              <Button
                variant="link"
                onClick={() => {
                  setShowNewListForm(true);
                  setExistingList('');
                }}
                className="mb-3"
              >
                Create new list
              </Button>
            )}
            {!showNewListForm && (
              <SelectField
                name="existingList"
                label="Existing list"
                value={existingList}
                options={existingListsOptions}
                handleChange={({ target: { value } }) => setExistingList(value)}
                blankOption
              />
            )}
            {showNewListForm && (
              <TextField
                name="newListName"
                label="New list name"
                value={newListName}
                handleChange={({ target: { value } }) => setNewListName(value)}
                placeholder="My super cool list"
              />
            )}
            {copy && (
              <CheckboxField
                name="updateCurrentItems"
                label="Would you like to also update the current items?"
                handleChange={() => setUpdateCurrentItems(!updateCurrentItems)}
                value={updateCurrentItems}
                classes="mt-3"
              />
            )}
          </>
        )}
        <hr />
        <div>Update attributes for all items.</div>
        <br />
        {props.list.type === 'BookList' && (
          <TextField
            name="author"
            label="Author"
            value={author}
            handleChange={({ target: { value } }) => setAuthor(value)}
            placeholder="Kurt Vonnagut"
            disabled={clearAuthor}
            child={
              <CheckboxField
                name="clearAuthor"
                label="Clear author"
                handleChange={() => {
                  if (!clearAuthor && author) {
                    setAuthor('');
                  }
                  if (clearAuthor && initialAuthor) {
                    setAuthor(initialAuthor);
                  }
                  setClearAuthor(!clearAuthor);
                }}
                value={clearAuthor}
                classes="ml-1 mt-1"
              />
            }
          />
        )}
        {props.list.type === 'GroceryList' && (
          <TextField
            name="quantity"
            label="Quantity"
            value={quantity}
            handleChange={({ target: { value } }) => setQuantity(value)}
            placeholder="3 bags"
            disabled={clearQuantity}
            child={
              <CheckboxField
                name="clearQuantity"
                label="Clear quantity"
                handleChange={() => {
                  if (!clearQuantity && quantity) {
                    setQuantity('');
                  }
                  if (clearQuantity && initialQuantity) {
                    setQuantity(initialQuantity);
                  }
                  setClearQuantity(!clearQuantity);
                }}
                value={clearQuantity}
                classes="ml-1 mt-1"
              />
            }
          />
        )}
        {props.list.type === 'MusicList' && (
          <>
            <TextField
              name="artist"
              label="Artist"
              value={artist}
              handleChange={({ target: { value } }) => setArtist(value)}
              placeholder="Sir Mix-a-Lot"
              disabled={clearArtist}
              child={
                <CheckboxField
                  name="clearArtist"
                  label="Clear artist"
                  handleChange={() => {
                    if (!clearArtist && artist) {
                      setArtist('');
                    }
                    if (clearArtist && initialArtist) {
                      setArtist(initialArtist);
                    }
                    setClearArtist(!clearArtist);
                  }}
                  value={clearArtist}
                  classes="ml-1 mt-1"
                />
              }
            />
            <TextField
              name="album"
              label="Album"
              value={album}
              handleChange={({ target: { value } }) => setAlbum(value)}
              placeholder="Mack Daddy"
              disabled={clearAlbum}
              child={
                <CheckboxField
                  name="clearAlbum"
                  label="Clear album"
                  handleChange={() => {
                    if (!clearAlbum && album) {
                      setAlbum('');
                    }
                    if (clearAlbum && initialAlbum) {
                      setAlbum(initialAlbum);
                    }
                    setClearAlbum(!clearAlbum);
                  }}
                  value={clearAlbum}
                  classes="ml-1 mt-1"
                />
              }
            />
          </>
        )}
        {props.list.type === 'ToDoList' && (
          <>
            <SelectField
              name="assigneeId"
              label="Assignee"
              value={assigneeId}
              handleChange={({ target: { value } }) => setAssigneeId(value)}
              options={props.listUsers.map((user) => ({ value: String(user.id), label: user.email }))}
              blankOption
              disabled={clearAssignee}
              child={
                <CheckboxField
                  name="clearAssignee"
                  label="Clear assignee"
                  handleChange={() => {
                    if (!clearAssignee && assigneeId) {
                      setAssigneeId('');
                    }
                    if (clearAssignee && initialAssigneeId) {
                      setAssigneeId(initialAssigneeId);
                    }
                    setClearAssignee(!clearAssignee);
                  }}
                  value={clearAssignee}
                  classes="ml-1 mt-1"
                />
              }
            />
            <DateField
              name="dueBy"
              label="Due By"
              value={dueBy}
              handleChange={({ target: { value } }) => setDueBy(value)}
              placeholder="mm/dd/yyyy"
              disabled={clearDueBy}
              child={
                <CheckboxField
                  name="clearDueBy"
                  label="Clear due by"
                  handleChange={() => {
                    if (!clearDueBy && dueBy) {
                      setDueBy('');
                    }
                    if (clearDueBy && initialDueBy) {
                      setDueBy(initialDueBy);
                    }
                    setClearDueBy(!clearDueBy);
                  }}
                  value={clearDueBy}
                  classes="ml-1 mt-1"
                />
              }
            />
          </>
        )}
        <CategoryField
          category={category}
          categories={props.categories}
          handleInput={({ target: { value } }) => setCategory(value)}
          disabled={clearCategory}
          child={
            <CheckboxField
              name="clearCategory"
              label="Clear category"
              handleChange={() => {
                if (!clearCategory && category) {
                  setCategory('');
                }
                if (clearCategory && initialCategory) {
                  setCategory(initialCategory);
                }
                setClearCategory(!clearCategory);
              }}
              value={clearCategory}
              classes="ml-1 mt-1"
            />
          }
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
