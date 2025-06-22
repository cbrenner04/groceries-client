import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { mockNavigate } from 'test-utils';

import NewSession, { type INewSessionProps } from './NewSession';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: INewSessionProps;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    signInUser: jest.fn(),
  };
  const component = render(
    <MemoryRouter>
      <NewSession {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('NewSession', () => {
  it('renders loading when fetch has not completed', async () => {
    axios.get = jest.fn();
    const { container, findByText } = setup();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders session form when fetch errors', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { container, findByLabelText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByLabelText('Email')).toBeVisible();
    expect(await findByLabelText('Password')).toBeVisible();
    expect(await findByLabelText('Remember me')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('redirects to /lists when fetch is successful', async () => {
    axios.get = jest.fn().mockResolvedValue({});

    setup();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('creates a new session on successful submission', async () => {
    axios.get = jest.fn().mockRejectedValue({
      response: { status: 401 },
    });
    axios.post = jest.fn().mockResolvedValue({
      data: { data: { uid: 1 } },
      headers: { 'access-token': 'foo', client: 'bar' },
    });

    const { findByLabelText, findByRole, props, user } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.type(await findByLabelText('Password'), 'foo');
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(props.signInUser).toHaveBeenCalledWith('foo', 'bar', 1);
    expect(toast).toHaveBeenCalledWith('Welcome foo@example.com!', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('displays error on failed submission', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

    const { findByLabelText, findByRole, user } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.type(await findByLabelText('Password'), 'foo');
    await user.click(await findByLabelText('Remember me'));
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong. Please check your credentials and try again.', {
      type: 'error',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });
});
