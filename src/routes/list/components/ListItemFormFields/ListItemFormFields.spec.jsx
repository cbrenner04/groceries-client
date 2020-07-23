import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ListItemFormFields from './index';

describe('ListItemFormFields', () => {
  const props = {
    setFormData: jest.fn(),
    formData: {
      product: '',
      task: '',
      quantity: '',
      author: '',
      title: '',
      artist: '',
      album: '',
      assigneeId: '',
      dueBy: '2020-05-21',
      numberInSeries: 0,
      category: '',
      read: false,
      purchased: false,
      completed: false,
    },
  };

  it('render Book fields when listType is BookList and calls setFormData when input is changed', () => {
    props.listType = 'BookList';
    const { container, getByLabelText } = render(<ListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Author')).toBeTruthy();

    fireEvent.change(getByLabelText('Author'), { target: { value: 'a' } });

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render Grocery fields when listType is GroceryList and calls setFormData when input is changed', () => {
    props.listType = 'GroceryList';
    const { container, getByLabelText } = render(<ListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Product')).toBeTruthy();

    fireEvent.change(getByLabelText('Product'), { target: { value: 'a' } });

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render Music fields when listType is MusicList and calls setFormData when input is changed', () => {
    props.listType = 'MusicList';
    const { container, getByLabelText } = render(<ListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Album')).toBeTruthy();

    fireEvent.change(getByLabelText('Album'), { target: { value: 'a' } });

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render ToDo fields when listType is ToDoList and calls setFormData when input is changed', () => {
    props.listType = 'ToDoList';
    const { container, getByLabelText } = render(<ListItemFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Task')).toBeTruthy();

    fireEvent.change(getByLabelText('Task'), { target: { value: 'a' } });

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('sets value for numberInSeries as a number when input', () => {
    props.listType = 'BookList';
    const { getByLabelText } = render(<ListItemFormFields {...props} />);

    fireEvent.change(getByLabelText('Number in series'), { target: { value: '2' } });

    expect(props.setFormData).toHaveBeenCalled();
  });
});
