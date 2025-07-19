import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import { EListType } from 'typings';
import type { IV2ListItem, IListItemField } from 'typings';
import ChangeOtherListModal, { type IChangeOtherListModalProps } from './ChangeOtherListModal';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IChangeOtherListModalProps;
}

const mockFields: IListItemField[] = [
  {
    id: 'field-1',
    label: 'name',
    data: 'Apples',
    list_item_field_configuration_id: 'config-1',
    user_id: 'user-1',
    list_item_id: 'item-1',
    created_at: new Date().toISOString(),
    updated_at: null,
    archived_at: null,
    position: 0,
    data_type: 'free_text' as 'free_text',
  },
  {
    id: 'field-2',
    label: 'quantity',
    data: '3',
    list_item_field_configuration_id: 'config-2',
    user_id: 'user-1',
    list_item_id: 'item-1',
    created_at: new Date().toISOString(),
    updated_at: null,
    archived_at: null,
    position: 1,
    data_type: 'number' as 'number',
  },
];

const mockV2Item: IV2ListItem = {
  id: 'item-1',
  user_id: 'user-1',
  list_id: 'list-1',
  completed: false,
  refreshed: false,
  created_at: new Date().toISOString(),
  updated_at: null,
  archived_at: null,
  fields: mockFields,
};

function setup(suppliedProps?: Partial<IChangeOtherListModalProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IChangeOtherListModalProps = {
    copy: false,
    move: false,
    show: true,
    setShow: jest.fn(),
    currentList: {
      id: 'list-1',
      name: 'Current List',
      type: EListType.GROCERY_LIST,
      created_at: new Date('2023-01-01').toISOString(),
      completed: false,
      owner_id: 'user-1',
      refreshed: false,
    },
    items: [mockV2Item],
    lists: [
      {
        id: 'list-2',
        name: 'Existing List',
        type: EListType.GROCERY_LIST,
        created_at: new Date('2023-01-01').toISOString(),
        completed: false,
        owner_id: 'user-1',
        refreshed: false,
      },
    ],
    setSelectedItems: jest.fn(),
    setIncompleteMultiSelect: jest.fn(),
    setCompleteMultiSelect: jest.fn(),
    handleMove: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ChangeOtherListModal {...props} />);

  return { ...component, props, user };
}

function instructions(copyOrMove: string): string {
  return `Choose an existing list or create a new one to ${copyOrMove} items`;
}

const noExistingListCopy =
  'You do not have any other lists with the same configuration. Please create a new list to take this action.';

describe('ChangeOtherListModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders appropriate instructions when copy and lists', async () => {
    const { findByText, queryByText } = setup({ copy: true });

    expect(await findByText(instructions('copy'))).toBeVisible();
    expect(queryByText(noExistingListCopy)).toBeNull();
    expect((await findByText(instructions('copy'))).parentElement).toMatchSnapshot();
  });

  it('renders appropriate instructions when move and lists', async () => {
    const { findByText, queryByText } = setup({ move: true });

    expect(await findByText(instructions('move'))).toBeVisible();
    expect(queryByText(noExistingListCopy)).toBeNull();
    expect((await findByText(instructions('move'))).parentElement).toMatchSnapshot();
  });

  it('renders appropriate instructions when no lists', async () => {
    const { findByText, getByLabelText, queryByLabelText, queryByText } = setup({ copy: true, lists: [] });

    expect(queryByText(instructions('copy'))).toBeNull();
    expect(await findByText(noExistingListCopy)).toBeTruthy();
    expect(getByLabelText('New list name')).toBeTruthy();
    expect(queryByLabelText('Existing list')).toBeNull();
    expect(await findByText(noExistingListCopy)).toMatchSnapshot();
  });

  it('handleNewListNameInput', async () => {
    const { getByLabelText, getByText, user } = setup({ move: true });

    await user.click(getByText('Create new list'));
    await user.type(getByLabelText('New list name'), 'foobar');

    expect(getByLabelText('New list name')).toHaveValue('foobar');
  });

  it('handleExistingListSelect', async () => {
    const { getByLabelText, getByText, user } = setup({ copy: true });

    // make sure choose existing list works
    await user.click(getByText('Create new list'));
    await user.click(getByText('Choose existing list'));
    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);

    expect(getByLabelText('Existing list')).toHaveValue('list-2');
  });

  it('handleSubmit with existing list', async () => {
    axios.put = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(axios.put).toHaveBeenCalledWith('/v2/lists/list-1/list_items/bulk_update?item_ids=item-1', {
      list_items: {
        copy: true,
        existing_list_id: 'list-2',
        move: false,
        new_list_name: undefined,
      },
    });
    expect(props.setShow).toHaveBeenCalledWith(false);
    expect(props.setSelectedItems).toHaveBeenCalledWith([]);
    expect(props.setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(props.setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(props.handleMove).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Items successfully updated', { type: 'info' });
  });

  it('handleSubmit with new list name', async () => {
    axios.put = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText, props, user } = setup({ move: true });

    await user.click(getByText('Create new list'));
    await user.type(getByLabelText('New list name'), 'New List Name');
    await user.click(getByText('Complete'));

    expect(axios.put).toHaveBeenCalledWith('/v2/lists/list-1/list_items/bulk_update?item_ids=item-1', {
      list_items: {
        copy: false,
        existing_list_id: undefined,
        move: true,
        new_list_name: 'New List Name',
      },
    });
    expect(props.setShow).toHaveBeenCalledWith(false);
    expect(props.setSelectedItems).toHaveBeenCalledWith([]);
    expect(props.setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(props.setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(props.handleMove).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Items successfully updated', { type: 'info' });
  });

  it('shows error toast when neither existing list nor new list name is provided', async () => {
    const { getByText, user } = setup({ copy: true });

    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('Please select an existing list or enter a new list name', { type: 'error' });
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('handles 401 error response', async () => {
    const axiosError = {
      response: { status: 401 },
    } as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
  });

  it('handles 404 error response', async () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('One or more items were not found', { type: 'error' });
  });

  it('handles 403 error response', async () => {
    const axiosError = {
      response: { status: 403 },
    } as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('You do not have permission to perform this action', { type: 'error' });
  });

  it('handles generic error response', async () => {
    const axiosError = {
      response: { status: 500 },
    } as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('Failed to update items. Please try again.', { type: 'error' });
  });

  it('handles network error', async () => {
    const axiosError = {
      request: {},
    } as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('Network error. Please check your connection.', { type: 'error' });
  });

  it('handles unexpected error', async () => {
    const axiosError = {} as AxiosError;
    axios.put = jest.fn().mockRejectedValue(axiosError);
    const { getByLabelText, getByText, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(toast).toHaveBeenCalledWith('An unexpected error occurred. Please try again.', { type: 'error' });
  });

  it('cancel', async () => {
    const { getByLabelText, getByText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Cancel'));

    expect(props.setShow).toHaveBeenCalledWith(false);
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('close', async () => {
    const { getByLabelText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Close'));

    expect(props.setShow).toHaveBeenCalledWith(false);
  });

  it('switches between new list and existing list forms', async () => {
    const { getByText, queryByLabelText, getByLabelText, user } = setup({ copy: true });

    // Initially shows existing list form
    expect(getByLabelText('Existing list')).toBeInTheDocument();
    expect(queryByLabelText('New list name')).not.toBeInTheDocument();

    // Switch to new list form
    await user.click(getByText('Create new list'));
    expect(queryByLabelText('Existing list')).not.toBeInTheDocument();
    expect(getByLabelText('New list name')).toBeInTheDocument();

    // Switch back to existing list form
    await user.click(getByText('Choose existing list'));
    expect(getByLabelText('Existing list')).toBeInTheDocument();
    expect(queryByLabelText('New list name')).not.toBeInTheDocument();
  });

  it('handles multiple items correctly', async () => {
    const multipleItems: IV2ListItem[] = [
      mockV2Item,
      {
        ...mockV2Item,
        id: 'item-2',
        fields: [
          {
            ...mockFields[0],
            id: 'field-3',
            list_item_id: 'item-2',
            data: 'Bananas',
          },
        ],
      },
    ];

    axios.put = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText, user } = setup({ copy: true, items: multipleItems });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['Existing List']);
    await user.click(getByText('Complete'));

    expect(axios.put).toHaveBeenCalledWith('/v2/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2', {
      list_items: {
        copy: true,
        existing_list_id: 'list-2',
        move: false,
        new_list_name: undefined,
      },
    });
  });

  it('shows new list form by default when no existing lists', async () => {
    const { getByLabelText, queryByLabelText, queryByText } = setup({ copy: true, lists: [] });

    expect(getByLabelText('New list name')).toBeInTheDocument();
    expect(queryByLabelText('Existing list')).not.toBeInTheDocument();
    expect(queryByText('Choose existing list')).not.toBeInTheDocument();
  });
});
