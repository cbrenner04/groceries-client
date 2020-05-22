import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Grocery from './Grocery';

describe('Grocery', () => {
  const props = {
    product: 'foo',
    quantity: '2 bar',
    purchased: false,
    editForm: false,
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };

  it('renders base form when props.editForm is false', () => {
    props.editForm = false;
    const { container, queryByLabelText } = render(<Grocery {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, getByLabelText } = render(<Grocery {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Purchased')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    const { getByLabelText } = render(<Grocery {...props} />);

    fireEvent.change(getByLabelText('Product'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
