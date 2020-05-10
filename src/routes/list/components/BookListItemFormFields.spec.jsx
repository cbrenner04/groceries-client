import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import BookListItemFormFields from './BookListItemFormFields';

describe('BookListItemFormFields', () => {
  const props = {
    author: 'asdf',
    authorChangeHandler: jest.fn(),
    title: 'asdf',
    titleChangeHandler: jest.fn(),
    numberInSeries: 1,
    numberInSeriesChangeHandler: jest.fn(),
    category: 'asdf',
    categoryChangeHandler: jest.fn(),
    categories: ['asdf'],
  };

  it('renders base form when props.editForm is false', () => {
    props.editForm = false;
    const { container, queryByLabelText } = render(<BookListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeFalsy();
    expect(queryByLabelText('Read')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, queryByLabelText } = render(<BookListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeTruthy();
    expect(queryByLabelText('Read')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    props.purchasedChangeHandler = jest.fn();
    props.readChangeHandler = jest.fn();
    const { queryByLabelText } = render(<BookListItemFormFields {...props} />);

    fireEvent.change(queryByLabelText('Author'), { target: { value: 'a' } });

    expect(props.authorChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Title'), { target: { value: 'a' } });

    expect(props.titleChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Number in series'), { target: { value: 'a' } });

    expect(props.numberInSeriesChangeHandler).toHaveBeenCalled();

    fireEvent.change(queryByLabelText('Category'), { target: { value: 'a' } });

    expect(props.categoryChangeHandler).toHaveBeenCalled();

    fireEvent.click(queryByLabelText('Purchased'));

    expect(props.purchasedChangeHandler).toHaveBeenCalled();

    fireEvent.click(queryByLabelText('Read'));

    expect(props.readChangeHandler).toHaveBeenCalled();
  });
});
