import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';

import EditListForm, { type IEditListFormProps } from './EditListForm';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: IEditListFormProps;
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props: IEditListFormProps = {
    listId: 'id1',
    name: 'Test List',
    type: 'GroceryList',
    completed: false,
    archivedAt: null,
    refreshed: false,
    listItemConfigurationId: null,
  };
  const component = render(
    <MemoryRouter>
      <EditListForm {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('EditListForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct initial values', () => {
    const { getByText, getByLabelText } = setup();

    expect(getByText('Edit Test List')).toBeInTheDocument();
    expect(getByLabelText('Name')).toHaveValue('Test List');
    expect(getByLabelText('Type')).toHaveValue('GroceryList');
    expect(getByLabelText('Completed')).not.toBeChecked();
    expect(getByLabelText('Refreshed')).not.toBeChecked();
  });

  it('updates name when changed', async () => {
    const { getByLabelText, user } = setup();

    const nameInput = getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated List Name');

    expect(nameInput).toHaveValue('Updated List Name');
  });

  it('updates type when changed', async () => {
    const { getByLabelText, user } = setup();

    const typeSelect = getByLabelText('Type');
    await user.selectOptions(typeSelect, 'BookList');

    expect(typeSelect).toHaveValue('BookList');
  });

  it('updates completed when changed', async () => {
    const { getByLabelText, user } = setup();

    const completedCheckbox = getByLabelText('Completed');
    await user.click(completedCheckbox);

    expect(completedCheckbox).toBeChecked();
  });

  it('updates refreshed when changed', async () => {
    const { getByLabelText, user } = setup();

    const refreshedCheckbox = getByLabelText('Refreshed');
    await user.click(refreshedCheckbox);

    expect(refreshedCheckbox).toBeChecked();
  });

  it('makes put request, displays success toast, and redirects on successful submission', async () => {
    const mockPut = jest.fn().mockResolvedValue({ data: { success: true } });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledWith('/v2/lists/id1', {
      list: {
        name: 'Test List',
        completed: false,
        type: 'GroceryList',
        refreshed: false,
      },
    });
    expect(toast).toHaveBeenCalledWith('List successfully updated', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('sends updated form data on submission', async () => {
    const mockPut = jest.fn().mockResolvedValue({ data: { success: true } });
    (axios.put as jest.Mock) = mockPut;

    const { getByLabelText, getByText, user } = setup();

    // Update form fields
    const nameInput = getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const typeSelect = getByLabelText('Type');
    await user.selectOptions(typeSelect, 'BookList');

    const completedCheckbox = getByLabelText('Completed');
    await user.click(completedCheckbox);

    const refreshedCheckbox = getByLabelText('Refreshed');
    await user.click(refreshedCheckbox);

    // Submit form
    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledWith('/v2/lists/id1', {
      list: {
        name: 'Updated Name',
        completed: true,
        type: 'BookList',
        refreshed: true,
      },
    });
  });

  it('redirects to sign in page when 401 error', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      response: { status: 401 },
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists page when 403 error', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      response: { status: 403 },
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to lists page when 404 error', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      response: { status: 404 },
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('displays validation errors from response data', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      response: {
        status: 422,
        data: {
          name: 'cannot be blank',
          type: 'is not included in the list',
        },
      },
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('name cannot be blank and type is not included in the list', { type: 'error' });
  });

  it('displays generic error when request fails', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error message when unknown error occurs', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      message: 'Network error',
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Network error', { type: 'error' });
  });

  it('redirects to lists page when Cancel is clicked', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('renders with completed and refreshed initially checked when props indicate so', () => {
    const props: IEditListFormProps = {
      listId: 'id1',
      name: 'Completed List',
      type: 'GroceryList',
      completed: true,
      archivedAt: null,
      refreshed: true,
      listItemConfigurationId: null,
    };

    const { getByLabelText } = render(
      <MemoryRouter>
        <EditListForm {...props} />
      </MemoryRouter>,
    );

    expect(getByLabelText('Completed')).toBeChecked();
    expect(getByLabelText('Refreshed')).toBeChecked();
  });

  it('renders with different list types', () => {
    const props: IEditListFormProps = {
      listId: 'id1',
      name: 'Book List',
      type: 'BookList',
      completed: false,
      archivedAt: null,
      refreshed: false,
      listItemConfigurationId: null,
    };

    const { getByLabelText } = render(
      <MemoryRouter>
        <EditListForm {...props} />
      </MemoryRouter>,
    );

    expect(getByLabelText('Type')).toHaveValue('BookList');
  });

  it('prevents default form submission behavior', async () => {
    const mockPut = jest.fn().mockResolvedValue({ data: { success: true } });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
