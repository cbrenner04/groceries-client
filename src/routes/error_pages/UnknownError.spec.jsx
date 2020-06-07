import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import UnknownError from './UnknownError';

describe('UnknownError', () => {
  it('renders default styles', () => {
    const { container, getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    expect(container).toMatchSnapshot();
    expect(button.style.color).toBe('rgb(0, 123, 255)');
    expect(button.style.textDecoration).toBe('none');
  });

  it('updates styles on mouse hover', () => {
    const { container, getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    fireEvent.mouseEnter(button);

    expect(container).toMatchSnapshot();
    expect(button.style.color).toBe('rgb(0, 86, 179)');
    expect(button.style.textDecoration).toBe('underline');

    fireEvent.mouseLeave(button);

    expect(button.style.color).toBe('rgb(0, 123, 255)');
    expect(button.style.textDecoration).toBe('none');
  });

  it('reloads the page on click', () => {
    // get location to reset it later
    const { location } = window;
    // remove location in order to redefine reload
    delete window.location;
    // define location with reload as mock
    window.location = { reload: jest.fn() };

    const { getByRole } = render(<UnknownError />);
    const button = getByRole('button');

    fireEvent.click(button);

    expect(window.location.reload).toHaveBeenCalled();

    // return location back to original
    window.location = location;
  });
});
