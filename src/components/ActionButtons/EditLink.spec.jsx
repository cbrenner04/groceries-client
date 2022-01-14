import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EditLink from './EditLink';

describe('EditLink', () => {
  const renderEditLink = () => {
    const defaultProps = {
      to: '/fake/route',
      disabled: false,
      style: {},
      testID: 'foo',
    };
    return render(
      <MemoryRouter>
        <EditLink {...defaultProps} />
      </MemoryRouter>,
    );
  };

  it('renders a link', () => {
    const { getByRole } = renderEditLink();

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', '/fake/route');
  });

  // TODO: figure this out. not sure how to get the router location now
  describe.skip('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = renderEditLink();

      fireEvent.click(getByRole('link'));

      expect(window.location.pathname).toBe('/fake/route');
    });
  });
});
