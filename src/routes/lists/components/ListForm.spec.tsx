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
  const defaultProps = {
    pending: false,
    onFormSubmit: jest.fn(),
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
    const { findByText, queryByLabelText, user } = setup();

    expect(queryByLabelText('Name')).not.toBeInTheDocument();
    await user.click(await findByText('Add List'));
    expect(await findByText('Collapse Form')).toBeInTheDocument();
    expect(await findByText('Create List')).toBeInTheDocument();
    expect(await findByText('Type')).toBeInTheDocument();
    expect(await findByText('Name')).toBeInTheDocument();
  });

  it('collapses form', async () => {
    const { findByText, queryByLabelText, user } = setup();

    await user.click(await findByText('Add List'));
    expect(await findByText('Collapse Form')).toBeInTheDocument();
    await user.click(await findByText('Collapse Form'));
    await waitFor(() => {
      expect(queryByLabelText('Name')).not.toBeInTheDocument();
    });
  });

  it('changes the value in the name field', async () => {
    const { findByLabelText, findByText, user } = setup();

    await user.click(await findByText('Add List'));
    await user.type(await findByLabelText('Name'), 'foo');

    expect(await findByLabelText('Name')).toHaveValue('foo');
  });

  it('changes the value in the type field', async () => {
    const { findByLabelText, findByText, user } = setup();

    await user.click(await findByText('Add List'));
    await user.selectOptions(await findByLabelText('Type'), 'MusicList');

    expect(await findByLabelText('Type')).toHaveValue('MusicList');
  });

  it('calls props.onFormSubmit when form is submitted', async () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { findByLabelText, findAllByRole, findByText, props, user } = setup({ onFormSubmit });

    await user.click(await findByText('Add List'));
    await user.type(await findByLabelText('Name'), 'foo');
    await user.selectOptions(await findByLabelText('Type'), 'BookList');
    await user.click((await findAllByRole('button'))[0]); // 'Create List' is now the first button

    await waitFor(() => expect(props.onFormSubmit).toHaveBeenCalledTimes(1));

    expect(onFormSubmit).toHaveBeenCalledWith({ name: 'foo', type: 'BookList' });
  });

  it('disables submit when in pending state', async () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { findByText, findAllByRole } = setup({ pending: true, onFormSubmit });

    await userEvent.click(await findByText('Add List'));
    expect((await findAllByRole('button'))[0]).toBeDisabled();
  });
});
