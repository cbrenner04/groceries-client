import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Share from './Share';

const defaultProps = {
  to: '/fake/route',
};
const history = createMemoryHistory();

describe('Share', () => {
  let shareLink;

  beforeEach(() => {
    const { getByRole } = render(
      <Router history={history}>
        <Share {...defaultProps} />
      </Router>,
    );
    shareLink = getByRole('link');
  });

  it('renders a link', () => {
    expect(shareLink).toMatchSnapshot();
    expect(shareLink).toHaveAttribute('href', defaultProps.to);
  });

  describe('when link is clicked', () => {
    it('calls handleClick', () => {
      fireEvent.click(shareLink);

      expect(history.location.pathname).toBe(defaultProps.to);
    });
  });
});
