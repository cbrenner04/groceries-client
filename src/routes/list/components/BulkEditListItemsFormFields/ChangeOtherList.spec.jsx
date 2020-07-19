import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ChangeOtherList from './ChangeOtherList';

describe('ChangeOtherList', () => {
  let props;

  beforeEach(() => {
    props = {
      handleOtherListChange: jest.fn(),
      copy: false,
      move: false,
      showNewListForm: false,
      existingListsOptions: [
        {
          value: '1',
          label: 'foobar',
        },
      ],
      listType: 'GroceryList',
      handleInput: jest.fn(),
      handleShowNewListForm: jest.fn(),
      clearNewListForm: jest.fn(),
      existingList: '',
      newListName: '',
      updateCurrentItems: false,
    };
  });

  it('renders appropriate change list instructions when existingListsOptions', () => {
    props.copy = true;
    props.existingListsOptions = [
      {
        value: '1',
        label: 'foobar',
      },
    ];
    const { getByText, queryByText } = render(<ChangeOtherList {...props} />);

    expect(getByText('Choose an existing list or create a new one.')).toBeTruthy();
    expect(
      queryByText('You do not have any other Grocery Lists. Please create a new list to take this action.'),
    ).toBeNull();
  });

  it('renders appropriate change list instructions when no existingListsOptions', () => {
    props.copy = true;
    props.existingListsOptions = [];
    const { getByText, queryByText } = render(<ChangeOtherList {...props} />);

    expect(queryByText('Choose an existing list or create a new one.')).toBeNull();
    expect(
      getByText('You do not have any other Grocery Lists. Please create a new list to take this action.'),
    ).toBeTruthy();
  });

  it('renders when copy and handle change when selected', () => {
    props.copy = true;
    const { container, getByLabelText } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByLabelText('Copy'));

    expect(props.handleOtherListChange).toHaveBeenCalledWith(true);
  });

  it('renders when move and handle change when selected', () => {
    props.move = true;
    const { container, getByLabelText } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByLabelText('Move'));

    expect(props.handleOtherListChange).toHaveBeenCalledWith(false);
  });

  it('renders only radios when not copy and not move', () => {
    const { container, getByLabelText, queryByLabelText } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Copy')).toBeVisible();
    expect(getByLabelText('Move')).toBeVisible();
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(queryByLabelText('New list name')).toBeNull();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('shows choose existing list link when existingListsOptions and correct fields when showNewList and copy', () => {
    props.copy = true;
    props.showNewListForm = true;
    const { container, getByLabelText, queryByLabelText, getByRole } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Copy')).toBeVisible();
    expect(getByLabelText('Move')).toBeVisible();
    expect(getByRole('button')).toHaveTextContent('Choose existing list');
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(getByLabelText('New list name')).toBeVisible();
    expect(getByLabelText('Would you like to also update the current items?')).toBeVisible();
  });

  it('shows choose existing list link when existingListsOptions and correct fields when showNewList and move', () => {
    props.move = true;
    props.showNewListForm = true;
    const { container, getByLabelText, queryByLabelText, getByRole } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Copy')).toBeVisible();
    expect(getByLabelText('Move')).toBeVisible();
    expect(getByRole('button')).toHaveTextContent('Choose existing list');
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(getByLabelText('New list name')).toBeVisible();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('does not show choose existing list link when not existingListsOptions and showNewList', () => {
    props.move = true;
    props.showNewListForm = true;
    props.existingListsOptions = [];
    const { container, getByLabelText, queryByLabelText, queryByRole } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Copy')).toBeVisible();
    expect(getByLabelText('Move')).toBeVisible();
    expect(queryByRole('button')).toBeNull();
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(getByLabelText('New list name')).toBeVisible();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('shows create new list link when not showNewListForm', () => {
    props.copy = true;
    props.showNewListForm = false;
    const { container, getByLabelText, queryByLabelText, getByRole } = render(<ChangeOtherList {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Copy')).toBeVisible();
    expect(getByLabelText('Move')).toBeVisible();
    expect(getByRole('button')).toHaveTextContent('Create new list');
    expect(getByLabelText('Existing list')).toBeVisible();
    expect(queryByLabelText('New list name')).toBeNull();
    expect(getByLabelText('Would you like to also update the current items?')).toBeVisible();
  });
});
