import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'react-toastify';

import axios from 'utils/api';
import { EListType } from 'typings';
import ChangeOtherListModal, { type IChangeOtherListModalProps } from './ChangeOtherListModal';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IChangeOtherListModalProps;
}

function setup(suppliedProps?: Partial<IChangeOtherListModalProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IChangeOtherListModalProps = {
    copy: false,
    move: false,
    show: true,
    setShow: jest.fn(),
    currentList: {
      id: 'id1',
      name: 'foo',
      type: EListType.GROCERY_LIST,
      created_at: new Date('05/22/2020').toISOString(),
      completed: false,
      owner_id: 'id1',
      refreshed: false,
    },
    items: [
      {
        id: 'id1',
        product: 'foo',
        task: 'foo',
        quantity: 'foo',
        author: 'foo',
        title: 'foo',
        artist: 'foo',
        album: 'foo',
        assignee_id: 'id1',
        due_by: new Date('05/21/2020').toISOString(),
        read: false,
        number_in_series: 1,
        category: 'foo',
      },
    ],
    lists: [
      {
        id: 'id2',
        name: 'bar',
        type: EListType.GROCERY_LIST,
        created_at: new Date('05/22/2020').toISOString(),
        completed: false,
        owner_id: 'id2',
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

const noExistingListCopy = 'You do not have any other Grocery Lists. Please create a new list to take this action.';

describe('ChangeOtherListModal', () => {
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
    await user.selectOptions(getByLabelText('Existing list'), ['bar']);

    expect(getByLabelText('Existing list')).toHaveValue('id2');
  });

  it('handleSubmit', async () => {
    axios.put = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['bar']);
    await user.click(getByText('Complete'));

    expect(axios.put).toHaveBeenCalledWith('/lists/id1/v1/list_items/bulk_update?item_ids=id1', {
      list_items: {
        copy: true,
        existing_list_id: 'id2',
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

  it('cancel', async () => {
    const { getByLabelText, getByText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Existing list'));
    await user.selectOptions(getByLabelText('Existing list'), ['bar']);
    await user.click(getByText('Cancel'));

    expect(props.setShow).toHaveBeenCalledWith(false);
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('close', async () => {
    const { getByLabelText, props, user } = setup({ copy: true });

    await user.click(getByLabelText('Close'));

    expect(props.setShow).toHaveBeenCalledWith(false);
  });
});
