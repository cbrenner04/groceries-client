import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Refresh from './Refresh';

async function setup() {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  const props = {
    handleClick,
    testID: 'foo',
  };
  const { findByRole } = render(<Refresh {...props} />);
  const refreshButton = await findByRole('button');

  return { handleClick, refreshButton, user };
}

describe('Refresh', () => {
  it('renders a button', async () => {
    const { refreshButton } = await setup();

    expect(refreshButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', async () => {
      const { handleClick, refreshButton, user } = await setup();
      await user.click(refreshButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
