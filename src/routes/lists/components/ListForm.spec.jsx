import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ListForm from './ListForm';

describe('ListForm', () => {
  it('renders', () => {
    const { container } = render(<ListForm onFormSubmit={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });

  it('changes the value in the name field', () => {
    const { getByLabelText } = render(<ListForm onFormSubmit={jest.fn()} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'foo' } });

    expect(getByLabelText('Name')).toHaveValue('foo');
  });

  it('changes the value in the type field', () => {
    const { getByLabelText } = render(<ListForm onFormSubmit={jest.fn()} />);

    fireEvent.change(getByLabelText('Type'), { target: { value: 'MusicList' } });

    expect(getByLabelText('Type')).toHaveValue('MusicList');
  });

  it('calls props.onFormSubmit when form is submitted', () => {
    const onFormSubmit = jest.fn();
    const { getByLabelText, getAllByRole } = render(<ListForm onFormSubmit={onFormSubmit} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getAllByRole('button')[1]);

    expect(onFormSubmit).toHaveBeenCalledWith({ name: 'foo', type: 'BookList' });
  });
});
