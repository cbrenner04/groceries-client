import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Merge from './Merge';

async function setup(): Promise<{
  handleClick: jest.Mock;
  mergeButton: HTMLElement;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  const props = {
    handleClick,
    testID: 'test-id',
    disabled: false,
  };
  const { findByTestId } = render(<Merge {...props} />);
  const mergeButton = await findByTestId('test-id');

  return { handleClick, mergeButton, user };
}

describe('Merge', () => {
  it('renders', async () => {
    const { mergeButton } = await setup();

    expect(mergeButton).toBeVisible();
  });

  it('calls handleClick on click', async () => {
    const { handleClick, mergeButton, user } = await setup();

    await user.click(mergeButton);

    expect(handleClick).toHaveBeenCalled();
  });
});
