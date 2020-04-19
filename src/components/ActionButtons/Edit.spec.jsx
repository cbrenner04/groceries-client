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
  let editLink;

  beforeEach(() => {
    const { getByRole } = render(
      <Router history={history}>
        <Edit {...defaultProps} />
      </Router>
    );
    editLink = getByRole('link');
  });

  it('renders a link', () => {
    expect(editLink).toMatchSnapshot();
    expect(editLink).toHaveAttribute('href', defaultProps.to);
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      fireEvent.click(editLink);

      expect(history.location.pathname).toBe(defaultProps.to);
    });
  });
});
