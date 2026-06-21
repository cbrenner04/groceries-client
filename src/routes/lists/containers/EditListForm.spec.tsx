import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';

import EditListForm, { type IEditListFormProps } from './EditListForm';

const mockShowToast = showToast as Mocked<typeof showToast>;

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: IEditListFormProps;
  user: UserEvent;
}

function setup(overrides: Partial<IEditListFormProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const props: IEditListFormProps = {
    listId: 'id1',
    name: 'foo',
    completed: false,
    refreshed: false,
    archivedAt: null,
    listItemConfigurationId: 'cfg-1',
    onClose: vi.fn(),
    onSaved: vi.fn(),
    ...overrides,
  };
  const component = render(<EditListForm {...props} />);

  return { ...component, props, user };
}

describe('EditListForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders fields', () => {
    const { getByLabelText } = setup();

    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Completed')).toBeVisible();
    expect(getByLabelText('Refreshed')).toBeVisible();
  });

  it('updates name when changed', async () => {
    const { findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'a');

    expect(await findByLabelText('Name')).toHaveValue('a');
  });

  it('updates completed when changed', async () => {
    const { findByLabelText, user } = setup();

    await user.click(await findByLabelText('Completed'));

    expect(await findByLabelText('Completed')).toBeChecked();
  });

  it('updates refreshed when changed', async () => {
    const { findByLabelText, user } = setup();

    await user.click(await findByLabelText('Refreshed'));

    expect(await findByLabelText('Refreshed')).toBeChecked();
  });

  it('makes put, displays toast, calls onClose and onSaved on successful submission', async () => {
    axios.put = vi.fn().mockResolvedValue({ data: { foo: 'bar' } });
    const { container, props } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith('/lists/id1', {
        list: { name: 'foo', completed: false, refreshed: false },
      });
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully updated');
    expect(props.onClose).toHaveBeenCalled();
    expect(props.onSaved).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /lists when no onSaved is provided', async () => {
    axios.put = vi.fn().mockResolvedValue({ data: {} });
    const { container } = setup({ onSaved: undefined });

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });
  });

  it('redirects to user login when 401', async () => {
    axios.put = vi.fn().mockRejectedValue({ response: { status: 401 } });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('redirects to lists page when 403', async () => {
    axios.put = vi.fn().mockRejectedValue({ response: { status: 403 } });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });
  });

  it('redirects to lists page when 404', async () => {
    axios.put = vi.fn().mockRejectedValue({ response: { status: 404 } });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });
  });

  it('displays appropriate error message', async () => {
    axios.put = vi.fn().mockRejectedValue({
      response: {
        status: 500,
        data: { foo: 'bar', baz: 'foobar' },
      },
    });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and baz foobar');
    });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = vi.fn().mockRejectedValue({ request: 'request failed' });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  it('displays toast when unknown error', async () => {
    axios.put = vi.fn().mockRejectedValue({ message: 'request failed' });
    const { container } = setup();

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('request failed');
    });
  });

  it('calls onPendingChange callbacks during submission', async () => {
    axios.put = vi.fn().mockResolvedValue({ data: {} });
    const onPendingChange = vi.fn();
    const { container } = setup({ onPendingChange });

    const form = container.querySelector('form#edit-list-form') as HTMLFormElement;
    form.requestSubmit();

    await vi.waitFor(() => {
      expect(onPendingChange).toHaveBeenCalledWith(true);
      expect(onPendingChange).toHaveBeenCalledWith(false);
    });
  });
});
