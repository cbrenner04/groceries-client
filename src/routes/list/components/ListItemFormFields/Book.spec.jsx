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
    const { container, getByLabelText } = render(<Book {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Purchased')).toBeTruthy();
    expect(getByLabelText('Read')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    const { getByLabelText } = render(<Book {...props} />);

    fireEvent.change(getByLabelText('Author'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Title'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Number in series'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Read'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
