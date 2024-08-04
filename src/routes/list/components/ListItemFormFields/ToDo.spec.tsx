import React from 'react';
import { fireEvent, render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ToDo, { type IToDoFormFieldsProps } from './ToDo';

interface ISetupReturn extends RenderResult {
  props: IToDoFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IToDoFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    task: 'foo',
    assigneeId: '1',
    dueBy: '05/20/2020',
    completed: false,
    editForm: false,
    listUsers: [
      {
        id: 'id1',
        email: 'foo@example.com',
      },
    ],
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ToDo {...props} />);

  return { ...component, props, user };
}

describe('ToDo', () => {
  it('renders base form when props.editForm is false', () => {
    const { container, queryByLabelText } = setup({ editForm: false });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Completed')).toBeNull();
  });

  it('renders edit form when props.editForm is true', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Completed')).toBeVisible();
  });

  it('renders with defaults', async () => {
    const { container, findByLabelText, findByTestId, queryByLabelText } = setup({
      task: 'foo',
      assigneeId: '1',
      dueBy: '05/20/2020',
      completed: undefined,
      editForm: undefined,
      category: undefined,
      categories: undefined,
      inputChangeHandler: jest.fn(),
    });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Completed')).toBeNull();
    expect(await findByLabelText('Category')).toHaveValue('');
    expect((await findByTestId('categories')).firstChild).toBeNull();
  });

  it('calls appropriate change handlers when changes occur', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Task'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    fireEvent.change(await findByLabelText('Assignee'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    fireEvent.change(await findByLabelText('Due By'), { target: { value: 'a' } });

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(4);

    await user.click(await findByLabelText('Completed'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(5);
  });
});
