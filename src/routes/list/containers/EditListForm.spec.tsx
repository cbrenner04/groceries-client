import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';
import { showToast } from 'utils/toast';

import EditListForm, { type IEditListFormProps } from './EditListForm';

const mockShowToast = showToast as jest.Mocked<typeof showToast>;

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
    completed: false,
    archivedAt: null,
    refreshed: false,
    listItemConfigurationId: 'config-1',
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

    expect(getByText('Edit List')).toBeInTheDocument();
    expect(getByLabelText('Name')).toHaveValue('Test List');
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
    expect(mockPut).toHaveBeenCalledWith('/lists/id1', {
      list: {
        name: 'Test List',
        completed: false,
        refreshed: false,
      },
    });
    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully updated');
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

    const completedCheckbox = getByLabelText('Completed');
    await user.click(completedCheckbox);

    const refreshedCheckbox = getByLabelText('Refreshed');
    await user.click(refreshedCheckbox);

    // Submit form
    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledWith('/lists/id1', {
      list: {
        name: 'Updated Name',
        completed: true,
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
    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
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
    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
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
    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
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
    expect(mockShowToast.error).toHaveBeenCalledWith('name cannot be blank and type is not included in the list');
  });

  it('displays generic error when request fails', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('displays error message when unknown error occurs', async () => {
    const mockPut = jest.fn().mockRejectedValue({
      message: 'Network error',
    });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('Network error');
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
      completed: true,
      archivedAt: null,
      refreshed: true,
      listItemConfigurationId: 'config-1',
    };

    const { getByLabelText } = render(
      <MemoryRouter>
        <EditListForm {...props} />
      </MemoryRouter>,
    );

    expect(getByLabelText('Completed')).toBeChecked();
    expect(getByLabelText('Refreshed')).toBeChecked();
  });

  it('prevents default form submission behavior', async () => {
    const mockPut = jest.fn().mockResolvedValue({ data: { success: true } });
    (axios.put as jest.Mock) = mockPut;

    const { getByText, user } = setup();

    await user.click(getByText('Update List'));

    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
