import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Edit from './Edit';

describe('Edit', () => {
  let history;

  const renderEdit = () => {
    history = createMemoryHistory();
    const defaultProps = {
      to: '/fake/route',
    };
    return render(
      <Router history={history}>
        <Edit {...defaultProps} />
      </Router>,
    );
  };

  it('renders a link', () => {
    const { getByRole } = renderEdit();

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', '/fake/route');
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = renderEdit();

      fireEvent.click(getByRole('link'));

      expect(history.location.pathname).toBe('/fake/route');
    });
  });
});
