import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Complete from './Complete';

async function setup(): Promise<{
  completeButton: HTMLElement;
  handleClick: jest.Mock;
  user: UserEvent;
}> {
  const handleClick = jest.fn();
  const props = {
    handleClick,
    testID: 'foo',
  };
  const user = userEvent.setup();

  const { findByRole } = render(<Complete {...props} />);
  const completeButton = await findByRole('button');

  return { completeButton, handleClick, user };
}

describe('Complete', () => {
  it('renders a button', async () => {
    const { completeButton } = await setup();

    expect(completeButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', async () => {
      const { completeButton, handleClick, user } = await setup();
      await user.click(completeButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
