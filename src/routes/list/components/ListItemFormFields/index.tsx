import React, { type ChangeEventHandler } from 'react';

import type { IListUser, IListItem } from 'typings';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import Simple from './Simple';
import ToDo from './ToDo';

export interface IListItemFormFieldsProps {
  listType: string;
  listUsers?: IListUser[];
  categories?: string[];
  formData: IListItem;
  setFormData: ChangeEventHandler;
  editForm?: boolean;
}

const ListItemFormFields: React.FC<IListItemFormFieldsProps> = (props): React.JSX.Element =>
  ({
    BookList: (
      <Book
        author={props.formData.author ?? ''}
        title={props.formData.title ?? ''}
        numberInSeries={props.formData.number_in_series ?? 0}
        category={props.formData.category ?? ''}
        categories={props.categories ?? []}
        inputChangeHandler={props.setFormData}
        read={props.formData.read ?? false}
        purchased={props.formData.purchased ?? false}
        editForm={props.editForm ?? false}
      />
    ),
    GroceryList: (
      <Grocery
        quantity={props.formData.quantity ?? ''}
        product={props.formData.product ?? ''}
        category={props.formData.category ?? ''}
        categories={props.categories ?? []}
        inputChangeHandler={props.setFormData}
        purchased={props.formData.purchased ?? false}
        editForm={props.editForm ?? false}
      />
    ),
    MusicList: (
      <Music
        title={props.formData.title ?? ''}
        artist={props.formData.artist ?? ''}
        album={props.formData.album ?? ''}
        category={props.formData.category ?? ''}
        categories={props.categories ?? []}
        inputChangeHandler={props.setFormData}
        purchased={props.formData.purchased ?? false}
        editForm={props.editForm ?? false}
      />
    ),
    SimpleList: (
      <Simple
        content={props.formData.content ?? ''}
        category={props.formData.category ?? ''}
        categories={props.categories ?? []}
        inputChangeHandler={props.setFormData}
        completed={props.formData.completed ?? false}
        editForm={props.editForm ?? false}
      />
    ),
    ToDoList: (
      <ToDo
        task={props.formData.task ?? ''}
        assigneeId={props.formData.assignee_id ?? ''}
        listUsers={props.listUsers ?? []}
        dueBy={props.formData.due_by ?? ''}
        category={props.formData.category ?? ''}
        categories={props.categories ?? []}
        inputChangeHandler={props.setFormData}
        completed={props.formData.completed ?? false}
        editForm={props.editForm ?? false}
      />
    ),
  })[props.listType]!;

export default ListItemFormFields;
