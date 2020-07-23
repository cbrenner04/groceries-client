import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ToDo from './ToDo';

describe('ToDo', () => {
  const props = {
    assigneeId: 'foo',
    clearAssignee: false,
    handleClearAssignee: jest.fn(),
    handleInput: jest.fn(),
    dueBy: 'bar',
    clearDueBy: false,
    handleClearDueBy: jest.fn(),
    listUsers: [{ id: 1, email: 'foo@ex.co' }],
  };

  it('renders assigneeId input enabled when clearAssignee is false', () => {
    props.clearAssignee = false;
    const { container, getByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Assignee')).toBeEnabled();
  });

  it('renders assigneeId input disabled when clearAssignee is true', () => {
    props.clearAssignee = true;
    const { container, getByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Assignee')).toBeDisabled();
  });

  it('renders dueBy input enabled when clearDueBy is false', () => {
    props.clearDueBy = false;
    const { container, getByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Due By')).toBeEnabled();
  });

  it('renders dueBy input disabled when clearDueBy is true', () => {
    props.clearDueBy = true;
    const { container, getByLabelText } = render(<ToDo {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Due By')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    props.clearAssignee = false;
    const { getByLabelText, getAllByRole } = render(<ToDo {...props} />);

    fireEvent.change(getByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.handleClearAssignee).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Due By'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.handleClearDueBy).toHaveBeenCalled();
  });
});
