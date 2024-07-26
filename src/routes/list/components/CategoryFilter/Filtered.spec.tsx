import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Filtered, { type IFilteredProps } from './Filtered';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IFilteredProps;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    filter: 'foo',
    handleClearFilter: jest.fn(),
  };
  const component = render(<Filtered {...props} />);

  return { ...component, props, user };
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
