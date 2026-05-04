import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UnknownError from './UnknownError';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

describe('UnknownError', () => {
  it('renders empty state with refresh action', () => {
    const { container, getByRole } = render(<UnknownError />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('navigates to refresh current route on click', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(0);
  });
});
