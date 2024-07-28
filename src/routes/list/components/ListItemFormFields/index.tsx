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

const ListItemFormFields: React.FC<IListItemFormFieldsProps> = ({
  categories,
  listType,
  listUsers,
  formData,
  setFormData,
  editForm,
}): React.JSX.Element =>
  ({
    BookList: (
      <Book
        author={formData.author ?? ''}
        title={formData.title ?? ''}
        numberInSeries={formData.number_in_series ?? 0}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        read={formData.read ?? false}
        purchased={formData.purchased ?? false}
        editForm={editForm ?? false}
      />
    ),
    GroceryList: (
      <Grocery
        quantity={formData.quantity ?? ''}
        product={formData.product ?? ''}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        purchased={formData.purchased ?? false}
        editForm={editForm ?? false}
      />
    ),
    MusicList: (
      <Music
        title={formData.title ?? ''}
        artist={formData.artist ?? ''}
        album={formData.album ?? ''}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        purchased={formData.purchased ?? false}
        editForm={editForm ?? false}
      />
    ),
    SimpleList: (
      <Simple
        content={formData.content ?? ''}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        completed={formData.completed ?? false}
        editForm={editForm ?? false}
      />
    ),
    ToDoList: (
      <ToDo
        task={formData.task ?? ''}
        assigneeId={formData.assignee_id ?? ''}
        listUsers={listUsers ?? []}
        dueBy={formData.due_by ?? ''}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        completed={formData.completed ?? false}
        editForm={editForm ?? false}
      />
    ),
  })[listType]!;

export default ListItemFormFields;
