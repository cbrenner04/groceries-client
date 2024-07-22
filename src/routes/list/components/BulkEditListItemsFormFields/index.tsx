import React, { ChangeEventHandler } from 'react';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import ToDo from './ToDo';
import ChangeOtherList from './ChangeOtherList';
import { CategoryField, CheckboxField } from '../../../../components/FormFields';
import IListUsers from '../../../../typings/IListUsers';

interface IBulkEditListItemsFormFieldsProps {
  listType: string;
  formData: {
    copy: boolean;
    move: boolean;
    existingList: string;
    newListName: string;
    updateCurrentItems: boolean;
    album?: string;
    clearAlbum: boolean;
    artist?: string;
    clearArtist: boolean;
    assigneeId?: string;
    clearAssignee: boolean;
    author?: string;
    clearAuthor: boolean;
    category?: string;
    clearCategory: boolean;
    dueBy?: string;
    clearDueBy: boolean;
    quantity?: string;
    clearQuantity: boolean;
    showNewListForm: boolean;
    allComplete: boolean;
  };
  handleInput: ChangeEventHandler;
  clearAttribute: (attribute: string, clearAttribute: string) => void;
  listUsers: IListUsers[];
  handleOtherListChange: (isCopy: boolean) => void;
  existingListsOptions: {
    value: string;
    label: string;
  }[];
  handleShowNewListForm: () => void;
  clearNewListForm: () => void;
  categories: string[];
}

const BulkEditListItemsFormFields: React.FC<IBulkEditListItemsFormFieldsProps> = (props) => {
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
                  author={props.formData.author ?? ''}
                  clearAuthor={props.formData.clearAuthor}
                  handleClearAuthor={() => props.clearAttribute('author', 'clearAuthor')}
                  handleInput={props.handleInput}
                />
              ),
              GroceryList: (
                <Grocery
                  quantity={props.formData.quantity ?? ''}
                  clearQuantity={props.formData.clearQuantity}
                  handleClearQuantity={() => props.clearAttribute('quantity', 'clearQuantity')}
                  handleInput={props.handleInput}
                />
              ),
              MusicList: (
                <Music
                  artist={props.formData.artist ?? ''}
                  clearArtist={props.formData.clearArtist}
                  handleClearArtist={() => props.clearAttribute('artist', 'clearArtist')}
                  album={props.formData.album ?? ''}
                  clearAlbum={props.formData.clearAlbum}
                  handleClearAlbum={() => props.clearAttribute('album', 'clearAlbum')}
                  handleInput={props.handleInput}
                />
              ),
              // simple list has no updatable attributes
              ToDoList: (
                <ToDo
                  dueBy={props.formData.dueBy ?? ''}
                  clearDueBy={props.formData.clearDueBy}
                  handleClearDueBy={() => props.clearAttribute('dueBy', 'clearDueBy')}
                  assigneeId={props.formData.assigneeId ?? ''}
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

export default BulkEditListItemsFormFields;
