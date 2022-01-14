import React from 'react';
import { render } from '@testing-library/react';
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
});
