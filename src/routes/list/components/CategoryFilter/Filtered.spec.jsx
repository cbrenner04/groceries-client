import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Filtered from './Filtered';

describe('Filtered', () => {
  const props = {
    filter: 'foo',
    handleClearFilter: jest.fn(),
  };

  it('renders with filter name in button', () => {
    const { container, getByRole } = render(<Filtered {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('foo');
  });

  it('calls handleClearFilter when button is clicked', () => {
    const { getByRole } = render(<Filtered {...props} />);

    fireEvent.click(getByRole('button'));

    expect(props.handleClearFilter).toHaveBeenCalled();
  });
});
