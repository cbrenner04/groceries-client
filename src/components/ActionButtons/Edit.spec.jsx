import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Edit from './Edit';

const defaultProps = {
  to: '/fake/route',
};
const history = createMemoryHistory();

describe('Edit', () => {
  it('renders a link', () => {
    const { getByRole } = render(
      <Router history={history}>
        <Edit {...defaultProps} />
      </Router>
    );

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', defaultProps.to);
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = render(
        <Router history={history}>
          <Edit {...defaultProps} />
        </Router>
      );
      fireEvent.click(getByRole('link'));

      expect(history.location.pathname).toBe(defaultProps.to);
    });
  });
});
