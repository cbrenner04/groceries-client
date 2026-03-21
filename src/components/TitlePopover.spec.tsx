import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TitlePopover from './TitlePopover';

describe('TitlePopover', () => {
  it('renders', () => {
    const { container } = render(<TitlePopover title="foo" message="bar" />);

    expect(container).toMatchSnapshot();
  });

  it('shows popover content when button is clicked', async () => {
    const user = userEvent.setup();
    const { getByTestId, queryByTestId } = render(<TitlePopover title="foo" message="bar" />);

    expect(queryByTestId('popover-content')).toBeNull();
    await user.click(getByTestId('foo-popover'));
    expect(getByTestId('popover-content')).toHaveTextContent('bar');
  });

  it('hides popover when clicking outside', async () => {
    const user = userEvent.setup();
    const { getByTestId, queryByTestId } = render(
      <div>
        <TitlePopover title="foo" message="bar" />
        <span data-test-id="outside">outside</span>
      </div>,
    );

    await user.click(getByTestId('foo-popover'));
    expect(getByTestId('popover-content')).toBeVisible();

    await user.click(getByTestId('outside'));
    expect(queryByTestId('popover-content')).toBeNull();
  });

  it('hides popover when button is clicked again', async () => {
    const user = userEvent.setup();
    const { getByTestId, queryByTestId } = render(<TitlePopover title="foo" message="bar" />);

    await user.click(getByTestId('foo-popover'));
    expect(getByTestId('popover-content')).toBeVisible();

    await user.click(getByTestId('foo-popover'));
    expect(queryByTestId('popover-content')).toBeNull();
  });
});
