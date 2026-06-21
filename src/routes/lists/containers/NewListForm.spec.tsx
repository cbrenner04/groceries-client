import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { IListItemConfiguration } from 'typings';

import NewListForm from './NewListForm';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(suppliedProps?: {
  listItemConfigurations?: IListItemConfiguration[];
  onSubmit?: (name: string, templateId: string) => void;
  pending?: boolean;
}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    listItemConfigurations: [
      { id: 'config-1', name: 'Basic' },
      { id: 'config-2', name: 'Detailed' },
    ],
    onSubmit: vi.fn(),
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const renderResult = render(
    <NewListForm
      listItemConfigurations={props.listItemConfigurations}
      onSubmit={props.onSubmit}
      pending={props.pending}
    />,
  );
  return { ...renderResult, user };
}

describe('NewListForm', () => {
  it('renders', () => {
    const { getByTestId } = setup();
    expect(getByTestId('new-list-name-input')).toBeInTheDocument();
    expect(getByTestId('new-list-template-select')).toBeInTheDocument();
  });

  it('renders name input field', () => {
    const { getByTestId } = setup();
    const input = getByTestId('new-list-name-input') as HTMLInputElement;
    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('name', 'name');
    expect(input).toHaveAttribute('placeholder', 'My super cool list');
  });

  it('renders template selector', () => {
    const { getByTestId } = setup();
    const select = getByTestId('new-list-template-select') as HTMLSelectElement;
    expect(select).toHaveAttribute('id', 'new_list_item_configuration_id');
    expect(select.options.length).toBe(2);
    expect(select.options[0]).toHaveTextContent('Basic');
    expect(select.options[1]).toHaveTextContent('Detailed');
  });

  it('defaults to first template', () => {
    const { getByTestId } = setup();
    const select = getByTestId('new-list-template-select') as HTMLSelectElement;
    expect(select.value).toBe('config-1');
  });

  it('updates name field on input change', async () => {
    const { findByTestId, user } = setup();
    const input = await findByTestId('new-list-name-input');
    await user.type(input, 'My Test List');
    expect(input).toHaveValue('My Test List');
  });

  it('updates template selection on change', async () => {
    const { findByTestId, user } = setup();
    const select = await findByTestId('new-list-template-select');
    await user.selectOptions(select, 'config-2');
    expect(select).toHaveValue('config-2');
  });

  it('submits form when form submission occurs', () => {
    const onSubmit = vi.fn();
    const { container } = setup({ onSubmit });
    const form = container.querySelector('#new-list-form') as HTMLFormElement;

    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('disables inputs when pending', () => {
    const { getByTestId } = setup({ pending: true });
    const input = getByTestId('new-list-name-input') as HTMLInputElement;
    const select = getByTestId('new-list-template-select') as HTMLSelectElement;
    expect(input).toBeDisabled();
    expect(select).toBeDisabled();
  });
});
