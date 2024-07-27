import React, { type ChangeEventHandler } from 'react';

import type { IListUser } from 'typings';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import Simple from './Simple';
import ToDo from './ToDo';

// TODO: can this just be IListItem - I think this is confusing shit around the app
export interface IListITemsFormFieldsFormDataProps {
  id?: string;
  product?: string;
  task?: string;
  content?: string;
  quantity?: string;
  author?: string;
  title?: string;
  artist?: string;
  album?: string;
  assigneeId?: string;
  dueBy?: string;
  numberInSeries?: number;
  category?: string;
  read?: boolean;
  purchased?: boolean;
  completed?: boolean;
}

export interface IListItemFormFieldsProps {
  listType: string;
  listUsers?: IListUser[];
  categories?: string[];
  formData: IListITemsFormFieldsFormDataProps;
  setFormData: ChangeEventHandler;
  editForm?: boolean;
}

// TODO: reduce redundancy
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
        numberInSeries={formData.numberInSeries ?? 0}
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
        assigneeId={formData.assigneeId ?? ''}
        listUsers={listUsers ?? []}
        dueBy={formData.dueBy ?? ''}
        category={formData.category ?? ''}
        categories={categories ?? []}
        inputChangeHandler={setFormData}
        completed={formData.completed ?? false}
        editForm={editForm ?? false}
      />
    ),
  })[listType]!;

export default ListItemFormFields;
