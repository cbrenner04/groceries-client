import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditButton from './EditButton';

async function setup() {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  const props = {
    handleClick,
    testID: 'test-id',
  };
  const { findByTestId } = render(<EditButton {...props} />);
  const editButton = await findByTestId('test-id');

  return { editButton, handleClick, user };
}

describe('EditButton', () => {
  it('renders', async () => {
    const { editButton } = await setup();

    expect(editButton).toMatchSnapshot();
  });

  it('calls handleClick on click', async () => {
    const { editButton, handleClick, user } = await setup();
    await user.click(editButton);

    expect(handleClick).toHaveBeenCalled();
  });
});
