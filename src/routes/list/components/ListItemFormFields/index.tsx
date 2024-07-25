import React, { ChangeEventHandler } from 'react';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import Simple from './Simple';
import ToDo from './ToDo';
import { IListUser } from '../../../../typings';

// TODO: can this just be IListItem - I think this is confusing shit around the app
export interface IListITemsFormFieldsFormDataProps {
  id?: string;
  product?: string | null;
  task?: string;
  content?: string;
  quantity?: string | null;
  author?: string | null;
  title?: string;
  artist?: string | null;
  album?: string | null;
  assigneeId?: string | null;
  dueBy?: string | null;
  numberInSeries?: number | null;
  category?: string | null;
  read?: boolean;
  purchased?: boolean;
  completed?: boolean;
}

interface IListItemFormFieldsProps {
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
}) =>
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
  })[listType] ?? null;

export default ListItemFormFields;
