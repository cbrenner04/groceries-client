import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BulkEditListItemsFormFields from './index';
import { EListType } from '../../../../typings';

const defaultFormData = {
  copy: false,
  move: false,
  existingList: '',
  newListName: '',
  updateCurrentItems: false,
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
  dueBy: '',
  clearDueBy: false,
  quantity: '',
  clearQuantity: false,
  showNewListForm: false,
  allComplete: false,
};

function setup(suppliedProps: { listType?: EListType; formData?: typeof defaultFormData }) {
  const user = userEvent.setup();
  const defaultProps = {
    listType: 'GroceryList',
    formData: defaultFormData,
    handleInput: jest.fn(),
    clearAttribute: jest.fn(),
    listUsers: [
      {
        id: 'id1',
        email: '',
      },
    ],
    handleOtherListChange: jest.fn(),
    existingListsOptions: [
      {
        value: '1',
        label: 'Foo',
      },
    ],
    handleShowNewListForm: jest.fn(),
    clearNewListForm: jest.fn(),
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

    expect(props.clearAttribute).toHaveBeenCalledWith('dueBy', 'clearDueBy');

    await user.click((await findAllByRole('checkbox'))[2]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('does not render list item attribute fields when all items are completed', () => {
    const { container, queryByLabelText } = setup({
      listType: EListType.GROCERY_LIST,
      formData: { ...defaultFormData, allComplete: true },
    });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Quantity')).toBeNull();
  });
});
