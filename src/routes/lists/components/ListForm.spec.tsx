import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ListForm, { type IListFormProps } from './ListForm';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IListFormProps;
}

function setup(suppliedProps?: Partial<IListFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IListFormProps = {
    pending: false,
    onFormSubmit: jest.fn(),
    configurations: [
      {
        id: 'config-1',
        name: 'grocery list template',
        user_id: 'user-1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
    ],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListForm {...props} />);

  return { ...component, props, user };
}

describe('ListForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('expands form', async () => {
    const { baseElement, findByText, user } = setup();

    await user.click(await findByText('Add List'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    expect(baseElement.children[0].children[0]).toHaveClass('show');
  });

  it('collapses form', async () => {
    const { baseElement, findByText, user } = setup();

    await user.click(await findByText('Add List'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    await user.click(await findByText('Collapse Form'));
    await waitFor(() => expect(baseElement.children[0].children[0]).not.toHaveClass('show'));

    expect(baseElement.children[0].children[0]).not.toHaveClass('show');
  });

  it('changes the value in the name field', async () => {
    const { findByLabelText, user } = setup();

    await user.type(await findByLabelText('Name'), 'foo');

    expect(await findByLabelText('Name')).toHaveValue('foo');
  });

  it('changes the value in the template field', async () => {
    const { findByLabelText, user } = setup({
      configurations: [
        {
          id: 'config-1',
          name: 'grocery list template',
          user_id: 'user-1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
        {
          id: 'config-2',
          name: 'music list template',
          user_id: 'user-1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
      ],
    });

    await user.selectOptions(await findByLabelText('Template'), 'music list template');

    expect(await findByLabelText('Template')).toHaveValue('config-2');
  });

  it('calls props.onFormSubmit when form is submitted', async () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { findByLabelText, findAllByRole, props, user } = setup({ onFormSubmit });

    await user.type(await findByLabelText('Name'), 'foo');
    await user.click((await findAllByRole('button'))[1]);

    await waitFor(() => expect(props.onFormSubmit).toHaveBeenCalledTimes(1));

    expect(onFormSubmit).toHaveBeenCalledWith({ name: 'foo', list_item_configuration_id: 'config-1' });
  });

  it('disables submit when in pending state', async () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { findAllByRole } = setup({ pending: true, onFormSubmit });

    expect((await findAllByRole('button'))[1]).toBeDisabled();
  });
});
