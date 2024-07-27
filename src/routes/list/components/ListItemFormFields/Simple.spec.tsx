import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Simple, { type ISimpleFormFieldsProps } from './Simple';

interface ISetupReturn extends RenderResult {
  props: ISimpleFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<ISimpleFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    content: 'foo',
    completed: false,
    editForm: false,
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Simple {...props} />);

  return { ...component, props, user };
}

describe('Simple', () => {
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
      content: 'foo',
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

    await user.type(await findByLabelText('Content'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    await user.click(await findByLabelText('Completed'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);
  });
});
