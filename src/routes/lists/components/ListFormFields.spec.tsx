import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ListFormFields, { type IListFormFieldsProps } from './ListFormFields';
import { createListItemConfiguration } from 'test-utils/factories';

interface ISetupReturn extends RenderResult {
  props: IListFormFieldsProps;
  user: UserEvent;
}

const mockConfigurations = [
  createListItemConfiguration('config-1', 'grocery list template'),
  createListItemConfiguration('config-2', 'book list template'),
  createListItemConfiguration('config-3', 'music list template'),
];

function setup(suppliedProps?: Partial<IListFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IListFormFieldsProps = {
    name: 'foo',
    configurationId: 'config-1',
    configurations: mockConfigurations,
    handleNameChange: jest.fn(),
    handleConfigurationChange: jest.fn(),
    handleCompletedChange: jest.fn(),
    completed: false,
    editForm: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListFormFields {...props} />);

  return { ...component, props, user };
}

describe('ListFormFields', () => {
  it('renders new form', async () => {
    const { container, findByLabelText, queryByLabelText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Name')).toBeVisible();
    expect(await findByLabelText('Template')).toBeVisible();
    expect(queryByLabelText('Completed')).toBeNull();
  });

  it('renders edit form', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Name')).toBeVisible();
    expect(await findByLabelText('Template')).toBeVisible();
    expect(await findByLabelText('Completed')).toBeVisible();
  });

  it('renders configuration options from props', async () => {
    const { findByRole } = setup();

    const select = await findByRole('combobox', { name: 'Template' });
    expect(select).toBeVisible();

    // Check that all configuration options are present
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toBe('grocery list template');
    expect(options[1].textContent).toBe('book list template');
    expect(options[2].textContent).toBe('music list template');
  });

  it('calls appropriate change handlers on change of inputs', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Name'), 'a');

    expect(props.handleNameChange).toHaveBeenCalled();

    await user.selectOptions(await findByLabelText('Template'), 'config-2');

    expect(props.handleConfigurationChange).toHaveBeenCalled();

    await user.click(await findByLabelText('Completed'));

    expect(props.handleCompletedChange).toHaveBeenCalled();
  });
});
