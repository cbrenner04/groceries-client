import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import NewSession from './NewSession';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('NewSession', () => {
  let props;
  const renderNewSession = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <NewSession {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
    };
  });

  it('renders loading when fetch has not completed', () => {
    axios.get = () => new Promise();
    const { container, getByText } = renderNewSession(props);

    expect(container).toMatchSnapshot();
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders session form when fetch errors', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { container, getByLabelText } = renderNewSession(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Email')).toBeVisible();
    expect(getByLabelText('Password')).toBeVisible();
    expect(getByLabelText('Remember me')).toBeVisible();
  });

  it('redirects to /lists when fetch is successful', async () => {
    axios.get = jest.fn().mockResolvedValue({});

    renderNewSession(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(props.history.push).toHaveBeenCalledWith('/lists');
  });

  it('creates a new session on successful submission', async () => {
    axios.get = jest.fn().mockRejectedValue({
      response: { status: 401 },
    });
    axios.post = jest.fn().mockResolvedValue({
      data: { data: { uid: 1 } },
      headers: { 'access-token': 'foo', client: 'bar' },
    });
    const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

    const { getByLabelText, getByRole } = renderNewSession(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(spy).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        'access-token': 'foo',
        client: 'bar',
        uid: 1,
      }),
    );
    expect(toast).toHaveBeenCalledWith('Welcome foo@example.com!', { type: 'info' });
    expect(props.history.push).toHaveBeenCalledWith('/lists');
  });

  it('displays error on failed submission', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

    const { getByLabelText, getByRole } = renderNewSession(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.click(getByLabelText('Remember me'));
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong. Please check your credentials and try again.', {
      type: 'error',
    });
    expect(props.history.push).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });
});
