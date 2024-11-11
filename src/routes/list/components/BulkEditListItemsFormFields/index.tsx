import React, { type ChangeEventHandler } from 'react';

import { CategoryField, CheckboxField } from 'components/FormFields';
import { type IListUser } from 'typings';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import ToDo from './ToDo';

// TODO: This is ridiculous. Its just silly
export interface IBulkEditListItemsFormFieldsFormDataProps {
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
  due_by?: string;
  clearDueBy: boolean;
  quantity?: string;
  clearQuantity: boolean;
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
  categories: string[];
}

const BulkEditListItemsFormFields: React.FC<IBulkEditListItemsFormFieldsProps> = (props): React.JSX.Element => (
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
            dueBy={props.formData.due_by ?? ''}
            clearDueBy={props.formData.clearDueBy}
            handleClearDueBy={(): void => props.clearAttribute('due_by', 'clearDueBy')}
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
);

export default BulkEditListItemsFormFields;
