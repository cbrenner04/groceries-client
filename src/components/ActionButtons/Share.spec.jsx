import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Share from './Share';

describe('Share', () => {
  let history;

  const renderShare = () => {
    history = createMemoryHistory();
    const defaultProps = {
      to: '/fake/route',
      testID: 'foo',
      disabled: false,
      style: {},
    };
    return render(
      <Router history={history}>
        <Share {...defaultProps} />
      </Router>,
    );
  };

  it('renders a link', () => {
    const { getByRole } = renderShare();

    expect(getByRole('link')).toMatchSnapshot();
    expect(getByRole('link')).toHaveAttribute('href', '/fake/route');
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = renderShare();

      fireEvent.click(getByRole('link'));

      expect(history.location.pathname).toBe('/fake/route');
    });
  });
});
