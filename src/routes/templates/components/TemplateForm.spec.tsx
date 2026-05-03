import React from 'react';
import { fireEvent, render, type RenderResult, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import TemplateForm, { type ITemplateFormProps } from './TemplateForm';

interface ISetupReturn extends RenderResult {
  props: ITemplateFormProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<ITemplateFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ITemplateFormProps = {
    onFormSubmit: vi.fn(),
    pending: false,
    onCancel: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<TemplateForm {...props} />);

  return { ...component, props, user };
}

describe('TemplateForm', () => {
  it('renders name input field', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('template-form-name')).toBeVisible();
  });

  it('shows form submission buttons', async () => {
    const { findByText } = setup();
    expect(await findByText('Create Template')).toBeVisible();
    expect(await findByText('Cancel')).toBeVisible();
  });

  it('updates template name when input changes', async () => {
    const { findByTestId, user } = setup();
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');

    expect(nameInput).toHaveValue('My Template');
  });

  it('calls onFormSubmit with name and fields when submitted', async () => {
    const { findByText, findByTestId, props, user } = setup();

    await user.type(await findByTestId('template-form-name'), 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(await findByTestId('add-field-button'));
    await user.type(await findByTestId('field-row-label-1'), 'Field 2');
    await user.click(await findByText('Create Template'));

    expect(props.onFormSubmit).toHaveBeenCalled();
    const [name, fields] = (props.onFormSubmit as Mock).mock.calls[0];
    expect(name).toBe('My Template');
    expect(fields).toHaveLength(2);
  });

  it('clears form after submission', async () => {
    const { findByText, findByTestId, user } = setup({
      onFormSubmit: vi.fn().mockResolvedValue(undefined),
    });

    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(await findByText('Create Template'));

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('calls onCancel when cancel clicked', async () => {
    const { findByText, props, user } = setup();
    await user.click(await findByText('Cancel'));
    expect(props.onCancel).toHaveBeenCalled();
  });

  it('disables submit button when pending', async () => {
    const { findByText } = setup({ pending: true });
    const submitButton = await findByText('Create Template');
    expect(submitButton).toBeDisabled();
  });

  it('initializes with one default primary field', async () => {
    const { findByTestId } = setup();

    expect(await findByTestId('field-row-label-0')).toBeVisible();
    expect(await findByTestId('field-row-primary-0')).toBeChecked();
  });

  it('does not submit when form has empty field label', async () => {
    const { findByText, findByTestId, props, user } = setup();
    await user.type(await findByTestId('template-form-name'), 'My Template');
    await user.click(await findByText('Create Template'));

    await waitFor(() => {
      expect(props.onFormSubmit).not.toHaveBeenCalled();
    });
  });

  it('renders with snapshot', () => {
    const { container } = setup();
    expect(container).toMatchSnapshot();
  });

  it('does not submit when field rows have duplicate positions', async () => {
    const { findByText, findByTestId, props, user } = setup();

    await user.type(await findByTestId('template-form-name'), 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field One');
    await user.click(await findByText('Add Field'));
    await user.type(await findByTestId('field-row-label-1'), 'Field Two');

    const positionInput = await findByTestId('field-row-position-1');
    fireEvent.change(positionInput, { target: { value: '1' } });

    await user.click(await findByText('Create Template'));

    await waitFor(() => {
      expect(props.onFormSubmit).not.toHaveBeenCalled();
    });
  });
});
