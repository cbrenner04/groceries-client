import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Music from './Music';

describe('Music', () => {
  const props = {
    title: 'foo',
    artist: 'bar',
    album: 'baz',
    purchased: false,
    editForm: false,
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };

  it('renders base form when props.editForm is false', () => {
    props.editForm = false;
    const { container, queryByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, getByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Purchased')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    const { getByLabelText } = render(<Music {...props} />);

    fireEvent.change(getByLabelText('Title'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Artist'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Album'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
