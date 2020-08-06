import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Merge from './Merge';

describe('Merge', () => {
  let props;

  beforeEach(() => {
    props = {
      handleClick: jest.fn(),
      testID: 'test-id',
    };
  });

  it('renders', () => {
    const { container, getByTestId } = render(<Merge {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('test-id')).toBeVisible();
  });

  it('calls handleClick on click', () => {
    const { getByTestId } = render(<Merge {...props} />);

    fireEvent.click(getByTestId('test-id'));

    expect(props.handleClick).toHaveBeenCalled();
  });
});
