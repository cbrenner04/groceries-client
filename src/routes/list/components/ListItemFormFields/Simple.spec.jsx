import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Simple from './Simple';

describe('Simple', () => {
  const props = {
    content: 'foo',
    completed: false,
    editForm: false,
    listUsers: [
      {
        id: 1,
        email: 'foo@example.com',
      },
    ],
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };

  it('renders base form when props.editForm is false', () => {
    props.editForm = false;
    const { container, queryByLabelText } = render(<Simple {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Completed')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, getByLabelText } = render(<Simple {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Completed')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    const { getByLabelText } = render(<Simple {...props} />);

    fireEvent.change(getByLabelText('Content'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Completed'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
