import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import NewPassword from './NewPassword';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('NewPassword', () => {
  let props;
  const renderNewPassword = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <NewPassword {...props} />
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

  it('requests new password', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, getByLabelText, getByRole } = renderNewPassword(props);

    expect(container).toMatchSnapshot();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('has same outcome when error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { getByLabelText, getByRole } = renderNewPassword(props);

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });
});
