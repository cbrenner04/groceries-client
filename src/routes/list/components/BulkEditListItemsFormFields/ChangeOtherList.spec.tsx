import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EListType } from 'typings';

import ChangeOtherList, { type IChangeOtherListProps } from './ChangeOtherList';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IChangeOtherListProps;
}

function setup(suppliedProps?: Partial<IChangeOtherListProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
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
    listType: EListType.GROCERY_LIST,
    handleInput: jest.fn(),
    handleShowNewListForm: jest.fn(),
    clearNewListForm: jest.fn(),
    existingList: '',
    newListName: '',
    updateCurrentItems: false,
    allComplete: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ChangeOtherList {...props} />);

  return { ...component, props, user };
}

describe('ChangeOtherList', () => {
  it('renders appropriate change list instructions when existingListsOptions', async () => {
    const { findByText, queryByText } = setup({ copy: true });

    expect(await findByText('Choose an existing list or create a new one.')).toBeVisible();
    expect(
      queryByText('You do not have any other Grocery Lists. Please create a new list to take this action.'),
    ).toBeNull();
  });

  it('renders appropriate change list instructions when no existingListsOptions', async () => {
    const { findByText, queryByText } = setup({ copy: true, existingListsOptions: [] });

    expect(queryByText('Choose an existing list or create a new one.')).toBeNull();
    expect(
      await findByText('You do not have any other Grocery Lists. Please create a new list to take this action.'),
    ).toBeTruthy();
  });

  it('renders when copy and handle change when selected', async () => {
    const { container, findByLabelText, props, user } = setup({ copy: true });

    expect(container).toMatchSnapshot();

    await user.click(await findByLabelText('Copy'));

    expect(props.handleOtherListChange).toHaveBeenCalledWith(true);
  });

  it('renders when move and handle change when selected', async () => {
    const { container, findByLabelText, props, user } = setup({ move: true });

    expect(container).toMatchSnapshot();

    await user.click(await findByLabelText('Move'));

    expect(props.handleOtherListChange).toHaveBeenCalledWith(false);
  });

  it('renders only radios when not copy and not move', async () => {
    const { container, findByLabelText, queryByLabelText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Copy')).toBeVisible();
    expect(await findByLabelText('Move')).toBeVisible();
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(queryByLabelText('New list name')).toBeNull();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('shows choose existing list link when existingListsOptions; correct fields when showNewList & copy', async () => {
    const { container, findByLabelText, findByRole, queryByLabelText } = setup({
      copy: true,
      showNewListForm: true,
    });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Copy')).toBeVisible();
    expect(await findByLabelText('Move')).toBeVisible();
    expect(await findByRole('button')).toHaveTextContent('Choose existing list');
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(await findByLabelText('New list name')).toBeVisible();
    expect(await findByLabelText('Would you like to also update the current items?')).toBeVisible();
  });

  it('shows choose existing list link when existingListsOptions; correct fields when showNewList & move', async () => {
    const { container, findByLabelText, queryByLabelText, findByRole } = setup({
      move: true,
      showNewListForm: true,
    });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Copy')).toBeVisible();
    expect(await findByLabelText('Move')).toBeVisible();
    expect(await findByRole('button')).toHaveTextContent('Choose existing list');
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(await findByLabelText('New list name')).toBeVisible();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('does not show choose existing list link when not existingListsOptions and showNewList', async () => {
    const { container, findByLabelText, queryByLabelText, queryByRole } = setup({
      move: true,
      showNewListForm: true,
      existingListsOptions: [],
    });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Copy')).toBeVisible();
    expect(await findByLabelText('Move')).toBeVisible();
    expect(queryByRole('button')).toBeNull();
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(await findByLabelText('New list name')).toBeVisible();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });

  it('shows create new list link when not showNewListForm', async () => {
    const { container, findByLabelText, queryByLabelText, findByRole } = setup({ copy: true, showNewListForm: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Copy')).toBeVisible();
    expect(await findByLabelText('Move')).toBeVisible();
    expect(await findByRole('button')).toHaveTextContent('Create new list');
    expect(await findByLabelText('Existing list')).toBeVisible();
    expect(queryByLabelText('New list name')).toBeNull();
    expect(await findByLabelText('Would you like to also update the current items?')).toBeVisible();
  });

  it('does not render update current items when all items are complete', () => {
    const { container, queryByLabelText } = setup({ copy: true, allComplete: true });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Would you like to also update the current items?')).toBeNull();
  });
});
