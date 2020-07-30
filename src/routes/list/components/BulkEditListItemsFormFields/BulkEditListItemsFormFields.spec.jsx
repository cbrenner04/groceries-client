import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import BulkEditListItemsFormFields from './index';

describe('BulkEditListItemsFormFields', () => {
  const props = {
    listType: 'GroceryList',
    formData: {
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
    },
    handleInput: jest.fn(),
    clearAttribute: jest.fn(),
    listUsers: [
      {
        id: 1,
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

  it('render Book fields when listType is BookList and fires appropriate change handlers', () => {
    props.listType = 'BookList';
    const { container, getByLabelText, getAllByRole } = render(<BulkEditListItemsFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Author')).toBeTruthy();

    fireEvent.change(getByLabelText('Author'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('author', 'clearAuthor');

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render Grocery fields when listType is GroceryList and fires appropriate change handlers', () => {
    props.listType = 'GroceryList';
    const { container, getByLabelText, getAllByRole } = render(<BulkEditListItemsFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Quantity')).toBeTruthy();

    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('quantity', 'clearQuantity');

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render Music fields when listType is MusicList and fires appropriate change handlers', () => {
    props.listType = 'MusicList';
    const { container, getByLabelText, getAllByRole } = render(<BulkEditListItemsFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Album')).toBeTruthy();

    fireEvent.change(getByLabelText('Album'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('artist', 'clearArtist');

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('album', 'clearAlbum');

    fireEvent.click(getAllByRole('checkbox')[2]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('render ToDo fields when listType is ToDoList and fires appropriate change handlers', () => {
    props.listType = 'ToDoList';
    const { container, getByLabelText, getAllByRole } = render(<BulkEditListItemsFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Assignee')).toBeTruthy();

    fireEvent.change(getByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.clearAttribute).toHaveBeenCalledWith('assigneeId', 'clearAssignee');

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.clearAttribute).toHaveBeenCalledWith('dueBy', 'clearDueBy');

    fireEvent.click(getAllByRole('checkbox')[2]);

    expect(props.clearAttribute).toHaveBeenCalledWith('category', 'clearCategory');
  });

  it('does not render list item attribute fields when all items are completed', () => {
    props.listType = 'GroceryList';
    props.formData.allComplete = true;
    const { container, queryByLabelText } = render(<BulkEditListItemsFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Quantity')).toBeNull();
  });
});
