import React, { type ChangeEventHandler } from 'react';

import { CategoryField, CheckboxField } from 'components/FormFields';
import { type IListUser } from 'typings';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import ToDo from './ToDo';
import ChangeOtherList from './ChangeOtherList';

export interface IBulkEditListItemsFormFieldsFormDataProps {
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
}

export interface IBulkEditListItemsFormFieldsProps {
  listType: string;
  formData: IBulkEditListItemsFormFieldsFormDataProps;
  handleInput: ChangeEventHandler;
  clearAttribute: (
    attribute: keyof IBulkEditListItemsFormFieldsFormDataProps,
    clearAttribute: keyof IBulkEditListItemsFormFieldsFormDataProps,
  ) => void;
  listUsers: IListUser[];
  handleOtherListChange: (isCopy: boolean) => void;
  existingListsOptions: {
    value: string;
    label: string;
  }[];
  handleShowNewListForm: () => void;
  clearNewListForm: () => void;
  categories: string[];
}

const BulkEditListItemsFormFields: React.FC<IBulkEditListItemsFormFieldsProps> = (props): React.JSX.Element => {
  return (
    <React.Fragment>
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
        <React.Fragment>
          <div>Update attributes for all items.</div>
          <br />
          {
            {
              BookList: (
                <Book
                  author={props.formData.author ?? ''}
                  clearAuthor={props.formData.clearAuthor}
                  handleClearAuthor={(): void => props.clearAttribute('author', 'clearAuthor')}
                  handleInput={props.handleInput}
                />
              ),
              GroceryList: (
                <Grocery
                  quantity={props.formData.quantity ?? ''}
                  clearQuantity={props.formData.clearQuantity}
                  handleClearQuantity={(): void => props.clearAttribute('quantity', 'clearQuantity')}
                  handleInput={props.handleInput}
                />
              ),
              MusicList: (
                <Music
                  artist={props.formData.artist ?? ''}
                  clearArtist={props.formData.clearArtist}
                  handleClearArtist={(): void => props.clearAttribute('artist', 'clearArtist')}
                  album={props.formData.album ?? ''}
                  clearAlbum={props.formData.clearAlbum}
                  handleClearAlbum={(): void => props.clearAttribute('album', 'clearAlbum')}
                  handleInput={props.handleInput}
                />
              ),
              // simple list has no updatable attributes
              ToDoList: (
                <ToDo
                  dueBy={props.formData.dueBy ?? ''}
                  clearDueBy={props.formData.clearDueBy}
                  handleClearDueBy={(): void => props.clearAttribute('dueBy', 'clearDueBy')}
                  assigneeId={props.formData.assigneeId ?? ''}
                  clearAssignee={props.formData.clearAssignee}
                  handleClearAssignee={(): void => props.clearAttribute('assigneeId', 'clearAssignee')}
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
                handleChange={(): void => props.clearAttribute('category', 'clearCategory')}
                value={props.formData.clearCategory}
                classes="ms-1 mt-1"
              />
            }
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default BulkEditListItemsFormFields;
