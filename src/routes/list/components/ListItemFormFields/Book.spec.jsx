import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Book from './Book';

describe('Book', () => {
  const props = {
    author: 'asdf',
    inputChangeHandler: jest.fn(),
    title: 'asdf',
    numberInSeries: 1,
    category: 'asdf',
    categories: ['asdf'],
  };

  it('renders base form when props.editForm is false', () => {
    props.editForm = false;
    const { container, queryByLabelText } = render(<Book {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeFalsy();
    expect(queryByLabelText('Read')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, queryByLabelText } = render(<Book {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeTruthy();
    expect(queryByLabelText('Read')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    props.purchasedChangeHandler = jest.fn();
    props.readChangeHandler = jest.fn();
    const { queryByLabelText } = render(<Book {...props} />);

    fireEvent.change(queryByLabelText('Author'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Title'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Number in series'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(queryByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(queryByLabelText('Read'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
