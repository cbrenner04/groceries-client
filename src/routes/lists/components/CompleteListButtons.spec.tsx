import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CompleteListButtons, { type ICompleteListButtonsProps } from './CompleteListButtons';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: ICompleteListButtonsProps;
}

function setup(suppliedProps?: Partial<ICompleteListButtonsProps>, listOwnerId = 'id1'): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    onListRefresh: jest.fn(),
    onListDeletion: jest.fn(),
    userId: 'id1',
    list: {
      id: 'id1',
      owner_id: listOwnerId,
      name: 'foo',
      list_item_configuration_id: 'config-1',
      created_at: 'some date',
      completed: false,
      refreshed: false,
    },
    multiSelect: false,
    selectedLists: [],
    handleMerge: jest.fn(),
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<CompleteListButtons {...props} />);

  return { ...component, props, user };
}

describe('CompleteListButtons', () => {
  it('renders refresh disabled when user is not owner', async () => {
    const { container, findByTestId } = setup({ userId: 'id2' }, 'id1');

    expect(container).toMatchSnapshot();
    expect(await findByTestId('complete-list-refresh')).toBeDisabled();
    expect(await findByTestId('complete-list-refresh')).toHaveClass('list-button-disabled');
  });

  it('renders refresh enabled when user is owner', async () => {
    const { container, findByTestId } = setup({ userId: 'id1' }, 'id1');

    expect(container).toMatchSnapshot();
    expect(await findByTestId('complete-list-refresh')).toBeEnabled();
    expect(await findByTestId('complete-list-refresh')).toHaveClass('list-button-enabled');
  });

  it('calls props.onListRefresh when refresh button is clicked', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('complete-list-refresh'));

    expect(props.onListRefresh).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete button is clicked', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('complete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });

  it('calls handleMerge when Merge is selected', async () => {
    const { container, findByTestId, props, user } = setup({
      multiSelect: true,
      selectedLists: [
        {
          id: 'id1',
          name: 'foo',
          list_item_configuration_id: 'config-1',
          created_at: 'some date',
          completed: false,
          refreshed: false,
          owner_id: 'id1',
        },
        {
          id: 'id12',
          name: 'bar',
          list_item_configuration_id: 'config-1',
          created_at: 'some date',
          completed: false,
          refreshed: false,
          owner_id: 'id1',
        },
      ],
    });

    expect(container).toMatchSnapshot();

    await user.click(await findByTestId('complete-list-merge'));

    expect(props.handleMerge).toHaveBeenCalled();
  });
});
