import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EListType } from 'typings';

import IncompleteListButtons, { type IIncompleteListButtonsProps } from './IncompleteListButtons';

interface ISetupReturn extends RenderResult {
  props: IIncompleteListButtonsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IIncompleteListButtonsProps>, listOwnerId = 'id1'): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    userId: 'id1',
    list: {
      id: 'id1',
      owner_id: listOwnerId,
      name: 'foo',
      type: EListType.GROCERY_LIST,
      created_at: 'some date',
      completed: false,
      refreshed: false,
    },
    onListCompletion: jest.fn(),
    onListDeletion: jest.fn(),
    currentUserPermissions: 'write',
    multiSelect: false,
    handleMerge: jest.fn(),
    selectedLists: [],
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <IncompleteListButtons {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('IncompleteListButtons', () => {
  it('complete and edit are disabled when user is not owner', async () => {
    const { container, findByTestId } = setup({ userId: 'id2' }, 'id3');

    expect(container).toMatchSnapshot();
    expect(await findByTestId('incomplete-list-complete')).toBeDisabled();
    expect(await findByTestId('incomplete-list-complete')).toHaveClass('list-button-disabled');
    expect(await findByTestId('incomplete-list-edit')).toHaveStyle('pointer-events: none');
    expect(await findByTestId('incomplete-list-edit')).toHaveClass('list-button-disabled');
  });

  it('complete and edit are enabled when user is owner', async () => {
    const { container, findByTestId } = setup({ userId: 'id1' }, 'id1');

    expect(container).toMatchSnapshot();
    expect(await findByTestId('incomplete-list-complete')).toBeEnabled();
    expect(await findByTestId('incomplete-list-complete')).toHaveClass('list-button-enabled');
    expect(await findByTestId('incomplete-list-edit')).not.toHaveStyle('pointer-events: none');
    expect(await findByTestId('incomplete-list-edit')).toHaveClass('list-button-enabled');
  });

  it('edit is hidden when multiSelect and selectedLists > 1', () => {
    const { container, queryByTestId } = setup({
      multiSelect: true,
      selectedLists: [
        {
          id: 'id1',
          owner_id: 'id1',
          name: 'foo',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
        {
          id: 'id2',
          owner_id: 'id1',
          name: 'bar',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
      ],
    });

    expect(container).toMatchSnapshot();
    expect(queryByTestId('incomplete-list-edit')).toBeNull();
  });

  it('merge is displayed when multiSelect and selectedLists > 1', async () => {
    const { container, findByTestId } = setup({
      multiSelect: true,
      selectedLists: [
        {
          id: 'id1',
          owner_id: 'id1',
          name: 'foo',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
        {
          id: 'id2',
          owner_id: 'id1',
          name: 'bar',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
      ],
    });

    expect(container).toMatchSnapshot();
    expect(await findByTestId('incomplete-list-merge')).toBeVisible();
  });

  it('share is disabled when user does not have write permissions', async () => {
    const { container, findByTestId } = setup({ currentUserPermissions: 'read' });

    expect(container).toMatchSnapshot();
    expect(await findByTestId('incomplete-list-share')).toHaveStyle('pointer-events: none');
    expect(await findByTestId('incomplete-list-share')).toHaveClass('list-button-disabled');
  });

  it('share is hidden when multiSelect and selectedLists > 1', () => {
    const { container, queryByTestId } = setup({
      multiSelect: true,
      selectedLists: [
        {
          id: 'id1',
          owner_id: 'id1',
          name: 'foo',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
        {
          id: 'id2',
          owner_id: 'id1',
          name: 'bar',
          type: EListType.GROCERY_LIST,
          created_at: 'some date',
          completed: false,
          refreshed: false,
        },
      ],
    });

    expect(container).toMatchSnapshot();
    expect(queryByTestId('incomplete-list-share')).toBeNull();
  });

  it('share is enabled when user has write permissions and not multiSelect', async () => {
    const { container, findByTestId } = setup({ currentUserPermissions: 'write', multiSelect: false });

    expect(container).toMatchSnapshot();
    expect(await findByTestId('incomplete-list-share')).not.toHaveAttribute('disabled', '');
    expect(await findByTestId('incomplete-list-share')).toHaveClass('list-button-enabled');
  });

  it('calls props.onListCompletion when complete is clicked', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('incomplete-list-complete'));

    expect(props.onListCompletion).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete is clicked', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('incomplete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });
});
