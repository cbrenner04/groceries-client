import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UnknownError from './UnknownError';

describe('UnknownError', () => {
  it('renders default styles', () => {
    const { container, getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    expect(container).toMatchSnapshot();
    expect(button.style.color).toBe('rgb(0, 123, 255)');
    expect(button.style.textDecoration).toBe('none');
  });

  it('updates styles on mouse hover', async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    await user.hover(button);

    expect(container).toMatchSnapshot();
    expect(button.style.color).toBe('rgb(0, 86, 179)');
    expect(button.style.textDecoration).toBe('underline');

    await user.unhover(button);

    expect(button.style.color).toBe('rgb(0, 123, 255)');
    expect(button.style.textDecoration).toBe('none');
  });

  // TODO: figure out the location mock
  it('reloads the page on click', async () => {
    // get location to reset it later
    const { location } = window;

    Object.defineProperty(window, 'location', {
      value: {
        reload: jest.fn(),
      },
    });

    const user = userEvent.setup();
    const { getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    await user.click(button);

    expect(window.location.reload).toHaveBeenCalled();

    // return location back to original
    Object.defineProperty(window, 'location', {
      value: location,
    });
  });
});
