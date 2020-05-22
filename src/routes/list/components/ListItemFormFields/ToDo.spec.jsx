import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ToDo from './ToDo';

describe('ToDo', () => {
  const props = {
    task: 'foo',
    assigneeId: '1',
    dueBy: '05/20/2020',
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
    const { container, queryByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Completed')).toBeFalsy();
  });

  it('renders edit form when props.editForm is true', () => {
    props.editForm = true;
    const { container, getByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Completed')).toBeTruthy();
  });

  it('calls appropriate change handlers when changes occur', () => {
    props.editForm = true;
    const { getByLabelText } = render(<ToDo {...props} />);

    fireEvent.change(getByLabelText('Task'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Due By'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Category'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Completed'));

    expect(props.inputChangeHandler).toHaveBeenCalled();
  });
});
