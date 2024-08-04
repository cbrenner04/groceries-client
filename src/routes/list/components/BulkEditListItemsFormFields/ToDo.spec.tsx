import React from 'react';
import { render, fireEvent, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ToDo, { type IToDoProps } from './ToDo';

interface ISetupReturn extends RenderResult {
  props: IToDoProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IToDoProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    assigneeId: 'foo',
    clearAssignee: false,
    handleClearAssignee: jest.fn(),
    handleInput: jest.fn(),
    dueBy: 'bar',
    clearDueBy: false,
    handleClearDueBy: jest.fn(),
    listUsers: [{ id: 'id1', email: 'foo@ex.co' }],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ToDo {...props} />);

  return { ...component, props, user };
}

describe('ToDo', () => {
  it('renders assigneeId input enabled when clearAssignee is false', async () => {
    const { container, findByLabelText } = setup({ clearAssignee: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Assignee')).toBeEnabled();
  });

  it('renders assigneeId input disabled when clearAssignee is true', async () => {
    const { container, findByLabelText } = setup({ clearAssignee: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Assignee')).toBeDisabled();
  });

  it('renders dueBy input enabled when clearDueBy is false', async () => {
    const { container, findByLabelText } = setup({ clearDueBy: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Due By')).toBeEnabled();
  });

  it('renders dueBy input disabled when clearDueBy is true', async () => {
    const { container, findByLabelText } = setup({ clearDueBy: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Due By')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    const { findByLabelText, findAllByRole, props, user } = setup({ clearAssignee: false });

    fireEvent.change(await findByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.handleClearAssignee).toHaveBeenCalled();

    fireEvent.change(await findByLabelText('Due By'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.handleClearDueBy).toHaveBeenCalled();
  });
});
