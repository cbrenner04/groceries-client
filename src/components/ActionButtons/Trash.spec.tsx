import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Trash from './Trash';

async function setup(): Promise<{
  handleClick: jest.Mock;
  trashButton: HTMLElement;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  const props = {
    handleClick,
    testID: 'foo',
    disabled: false,
  };
  const { findByRole } = render(<Trash {...props} />);
  const trashButton = await findByRole('button');

  return { handleClick, trashButton, user };
}

describe('Trash', () => {
  it('renders a button', async () => {
    const { trashButton } = await setup();

    expect(trashButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', async () => {
      const { handleClick, trashButton, user } = await setup();
      await user.click(trashButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
