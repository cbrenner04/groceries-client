import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Share from './Share';

describe('Share', () => {
  const renderShare = () => {
    const defaultProps = {
      to: '/fake/route',
      testID: 'foo',
      disabled: false,
      style: {},
    };
    return render(
      <MemoryRouter>
        <Share {...defaultProps} />
      </MemoryRouter>,
    );
  };

  it('renders a link', () => {
    const { getByRole } = renderShare();

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', '/fake/route');
  });

  // TODO: figure this out
  describe.skip('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = renderShare();

      fireEvent.click(getByRole('link'));

      expect(window.location.pathname).toBe('/fake/route');
    });
  });
});
