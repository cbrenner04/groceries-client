import React from 'react';
import PropTypes from 'prop-types';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import ToDo from './ToDo';
import ChangeOtherList from './ChangeOtherList';
import { CategoryField, CheckboxField } from '../../../../components/FormFields';
import { listUsers } from '../../../../types';

const BulkEditListItemsFormFields = (props) => {
  return (
    <>
      <div>Move or copy these items to another list.</div>
      <br />
      <ChangeOtherList
        handleOtherListChange={props.handleOtherListChange}
        copy={props.formData.copy}
        move={props.formData.move}
        showNewListForm={props.formData.showNewListForm}
        existingListsOptions={props.existingListsOptions}
        listType={props.listType}
        handleInput={props.handleInput}
        handleShowNewListForm={props.handleShowNewListForm}
        clearNewListForm={props.clearNewListForm}
        existingList={props.formData.existingList}
        newListName={props.formData.newListName}
        updateCurrentItems={props.formData.updateCurrentItems}
        allComplete={props.formData.allComplete}
      />
      <hr />
      {!props.formData.allComplete && (
        <>
          <div>Update attributes for all items.</div>
          <br />
          {
            {
              BookList: (
                <Book
                  author={props.formData.author}
                  clearAuthor={props.formData.clearAuthor}
                  handleClearAuthor={() => props.clearAttribute('author', 'clearAuthor')}
                  handleInput={props.handleInput}
                />
              ),
              GroceryList: (
                <Grocery
                  quantity={props.formData.quantity}
                  clearQuantity={props.formData.clearQuantity}
                  handleClearQuantity={() => props.clearAttribute('quantity', 'clearQuantity')}
                  handleInput={props.handleInput}
                />
              ),
              MusicList: (
                <Music
                  artist={props.formData.artist}
                  clearArtist={props.formData.clearArtist}
                  handleClearArtist={() => props.clearAttribute('artist', 'clearArtist')}
                  album={props.formData.album}
                  clearAlbum={props.formData.clearAlbum}
                  handleClearAlbum={() => props.clearAttribute('album', 'clearAlbum')}
                  handleInput={props.handleInput}
                />
              ),
              // simple list has no updatable attributes
              ToDoList: (
                <ToDo
                  dueBy={props.formData.dueBy}
                  clearDueBy={props.formData.clearDueBy}
                  handleClearDueBy={() => props.clearAttribute('dueBy', 'clearDueBy')}
                  assigneeId={props.formData.assigneeId}
                  clearAssignee={props.formData.clearAssignee}
                  handleClearAssignee={() => props.clearAttribute('assigneeId', 'clearAssignee')}
                  handleInput={props.handleInput}
                  listUsers={props.listUsers}
                />
              ),
            }[props.listType]
          }
          <CategoryField
            name="category"
            category={props.formData.category}
            categories={props.categories}
            handleInput={props.handleInput}
            disabled={props.formData.clearCategory}
            child={
              <CheckboxField
                name="clearCategory"
                label="Clear category"
                handleChange={() => props.clearAttribute('category', 'clearCategory')}
                value={props.formData.clearCategory}
                classes="ms-1 mt-1"
              />
            }
          />
        </>
      )}
    </>
  );
};

BulkEditListItemsFormFields.propTypes = {
  listType: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    copy: PropTypes.bool.isRequired,
    move: PropTypes.bool.isRequired,
    existingList: PropTypes.string,
    newListName: PropTypes.string,
    updateCurrentItems: PropTypes.bool.isRequired,
    album: PropTypes.string,
    clearAlbum: PropTypes.bool.isRequired,
    artist: PropTypes.string,
    clearArtist: PropTypes.bool.isRequired,
    assigneeId: PropTypes.string,
    clearAssignee: PropTypes.bool.isRequired,
    author: PropTypes.string,
    clearAuthor: PropTypes.bool.isRequired,
    category: PropTypes.string,
    clearCategory: PropTypes.bool.isRequired,
    dueBy: PropTypes.string,
    clearDueBy: PropTypes.bool.isRequired,
    quantity: PropTypes.string,
    clearQuantity: PropTypes.bool.isRequired,
    showNewListForm: PropTypes.bool.isRequired,
    allComplete: PropTypes.bool.isRequired,
  }).isRequired,
  handleInput: PropTypes.func.isRequired,
  clearAttribute: PropTypes.func.isRequired,
  listUsers: PropTypes.arrayOf(listUsers).isRequired,
  handleOtherListChange: PropTypes.func.isRequired,
  existingListsOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  handleShowNewListForm: PropTypes.func.isRequired,
  clearNewListForm: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BulkEditListItemsFormFields;
