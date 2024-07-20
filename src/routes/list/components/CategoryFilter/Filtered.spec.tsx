import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Filtered from './Filtered';

function setup() {
  const user = userEvent.setup();
  const props = {
    filter: 'foo',
    handleClearFilter: jest.fn(),
  };
  const { container, findByRole } = render(<Filtered {...props} />);

  return { container, findByRole, props, user };
}

describe('Filtered', () => {
  it('renders with filter name in button', async () => {
    const { container, findByRole } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('foo');
  });

  it('calls handleClearFilter when button is clicked', async () => {
    const { findByRole, props, user } = setup();

    await user.click(await findByRole('button'));

    expect(props.handleClearFilter).toHaveBeenCalled();
  });
});
