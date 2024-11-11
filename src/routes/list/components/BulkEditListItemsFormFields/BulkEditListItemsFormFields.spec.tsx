import React from 'react';
import { fireEvent, render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EListType } from 'typings';

import BulkEditListItemsFormFields, {
  type IBulkEditListItemsFormFieldsProps,
  type IBulkEditListItemsFormFieldsFormDataProps,
} from './index';

const defaultFormData: IBulkEditListItemsFormFieldsFormDataProps = {
  album: '',
  clearAlbum: false,
  artist: '',
  clearArtist: false,
  assigneeId: '',
  clearAssignee: false,
  author: '',
  clearAuthor: false,
  category: '',
  clearCategory: false,
  due_by: '',
  clearDueBy: false,
  quantity: '',
  clearQuantity: false,
};

interface ISetupReturn extends RenderResult {
  props: IBulkEditListItemsFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBulkEditListItemsFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IBulkEditListItemsFormFieldsProps = {
    listType: EListType.GROCERY_LIST,
    formData: defaultFormData,
    handleInput: jest.fn(),
    clearAttribute: jest.fn(),
    listUsers: [
      {
        id: 'id1',
        email: '',
      },
    ],
    categories: ['foo'],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<BulkEditListItemsFormFields {...props} />);

  return { ...component, props, user };
}

describe('BulkEditListItemsFormFields', () => {
  it('render Book fields when listType is BookList and fires appropriate change handlers', async () => {
    const { container, findByLabelText, findAllByRole, props, user } = setup({ listType: EListType.BOOK_LIST });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Author')).toBeVisible();

    await user.type(await findByLabelText('Author'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('author', 'clearAuthor');

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render Grocery fields when listType is GroceryList and fires appropriate change handlers', async () => {
    const { container, findByLabelText, findAllByRole, props, user } = setup({ listType: EListType.GROCERY_LIST });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Quantity')).toBeVisible();

    await user.type(await findByLabelText('Quantity'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('quantity', 'clearQuantity');

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render Music fields when listType is MusicList and fires appropriate change handlers', async () => {
    const { container, findByLabelText, findAllByRole, props, user } = setup({ listType: EListType.MUSIC_LIST });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Album')).toBeVisible();

    await user.type(await findByLabelText('Album'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('artist', 'clearArtist');

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('album', 'clearAlbum');

    await user.click((await findAllByRole('checkbox'))[2]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render ToDo fields when listType is ToDoList and fires appropriate change handlers', async () => {
    const { container, findByLabelText, findAllByRole, props, user } = setup({ listType: EListType.TO_DO_LIST });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Assignee')).toBeVisible();

    // couldn't get userEvent to work here
    fireEvent.change(await findByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('assigneeId', 'clearAssignee');

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('due_by', 'clearDueBy');

    await user.click((await findAllByRole('checkbox'))[2]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });
});
