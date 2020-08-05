import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import EditButton from './EditButton';

describe('EditButton', () => {
  let props;

  beforeEach(() => {
    props = {
      handleClick: jest.fn(),
      'data-test-id': 'test-id',
    };
  });

  it('renders', () => {
    const { container, getByTestId } = render(<EditButton {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('test-id')).toBeVisible();
  });

  it('calls handleClick on click', () => {
    const { getByTestId } = render(<EditButton {...props} />);

    fireEvent.click(getByTestId('test-id'));

    expect(props.handleClick).toHaveBeenCalled();
  });
});
