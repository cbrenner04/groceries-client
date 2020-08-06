import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import EditLink from './EditLink';

describe('EditLink', () => {
  let history;

  const renderEditLink = () => {
    history = createMemoryHistory();
    const defaultProps = {
      to: '/fake/route',
      disabled: false,
      style: {},
      testID: 'foo',
    };
    return render(
      <Router history={history}>
        <EditLink {...defaultProps} />
      </Router>,
    );
  };

  it('renders a link', () => {
    const { getByRole } = renderEditLink();

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', '/fake/route');
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = renderEditLink();

      fireEvent.click(getByRole('link'));

      expect(history.location.pathname).toBe('/fake/route');
    });
  });
});
