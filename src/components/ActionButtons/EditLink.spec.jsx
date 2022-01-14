import React from 'react';
import { render } from '@testing-library/react';
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
});
