import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import NewPassword from './NewPassword';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const component = render(
    <MemoryRouter>
      <NewPassword />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('NewPassword', () => {
  it('requests new password', async () => {
    axios.post = vi.fn().mockResolvedValue({});
    const { container, findByLabelText, findByRole, user } = setup();

    expect(container).toMatchSnapshot();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(showToast.info).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('has same outcome when error occurs', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { findByLabelText, findByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(showToast.info).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });
});
