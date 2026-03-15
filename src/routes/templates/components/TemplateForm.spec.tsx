import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
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
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<TemplateForm {...props} />);

  return { ...component, props, user };
}

describe('TemplateForm', () => {
  it('renders add template button', () => {
    const { getByText } = setup();

    expect(getByText('Add Template')).toBeVisible();
  });

  it('opens form when add template button clicked', async () => {
    const { getByText, findByTestId, user } = setup();

    await user.click(getByText('Add Template'));

    expect(await findByTestId('template-form-name')).toBeVisible();
  });

  it('hides button when form is open', async () => {
    const { getByText, queryByText, user } = setup();

    await user.click(getByText('Add Template'));

    await waitFor(() => {
      expect(queryByText('Add Template')).not.toBeInTheDocument();
    });
  });

  it('shows name input field', async () => {
    const { getByText, findByTestId, user } = setup();

    await user.click(getByText('Add Template'));

    expect(await findByTestId('template-form-name')).toBeVisible();
  });

  it('shows form submission buttons', async () => {
    const { getByText, findByText, user } = setup();

    await user.click(getByText('Add Template'));

    expect(await findByText('Create Template')).toBeVisible();
    expect(await findByText('Collapse Form')).toBeVisible();
  });

  it('updates template name when input changes', async () => {
    const { getByText, findByTestId, user } = setup();

    await user.click(getByText('Add Template'));
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');

    expect(nameInput).toHaveValue('My Template');
  });

  it('calls onFormSubmit with name and fields when submitted', async () => {
    const { getByText, findByTestId, props, user } = setup();

    await user.click(getByText('Add Template'));
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');
    const firstFieldLabel = await findByTestId('field-row-label-0');
    await user.type(firstFieldLabel, 'Field 1');
    await user.click(await findByTestId('add-field-button'));
    const secondFieldLabel = await findByTestId('field-row-label-1');
    await user.type(secondFieldLabel, 'Field 2');
    await user.click(getByText('Create Template'));

    expect(props.onFormSubmit).toHaveBeenCalled();
    const [name, fields] = (props.onFormSubmit as Mock).mock.calls[0];
    expect(name).toBe('My Template');
    expect(fields).toHaveLength(2);
  });

  it('clears form after submission', async () => {
    const { getByText, findByTestId, user } = setup({
      onFormSubmit: vi.fn().mockResolvedValue(undefined),
    });

    await user.click(getByText('Add Template'));
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');
    const firstFieldLabel = await findByTestId('field-row-label-0');
    await user.type(firstFieldLabel, 'Field 1');
    await user.click(getByText('Create Template'));

    await waitFor(async () => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('closes form after successful submission', async () => {
    const { getByText, findByText, findByTestId, user } = setup({
      onFormSubmit: vi.fn().mockResolvedValue(undefined),
    });

    await user.click(getByText('Add Template'));
    await user.type(await findByTestId('template-form-name'), 'Test');
    const firstFieldLabel = await findByTestId('field-row-label-0');
    await user.type(firstFieldLabel, 'Field 1');
    await user.click(getByText('Create Template'));

    expect(await findByText('Add Template')).toBeVisible();
  });

  it('collapses form when collapse button clicked', async () => {
    const { getByText, findByText, user } = setup();

    await user.click(getByText('Add Template'));
    await user.click(getByText('Collapse Form'));

    expect(await findByText('Add Template')).toBeVisible();
  });

  it('disables submit button when pending', async () => {
    const { getByText, findByText, user } = setup({ pending: true });

    await user.click(getByText('Add Template'));
    const submitButton = await findByText('Create Template');

    expect(submitButton).toBeDisabled();
  });

  it('initializes with one default field', async () => {
    const { getByText, findByTestId, user } = setup();

    await user.click(getByText('Add Template'));

    const firstFieldLabel = await findByTestId('field-row-label-0');
    expect(firstFieldLabel).toBeVisible();
  });

  it('first field is primary by default', async () => {
    const { getByText, findByTestId, user } = setup();

    await user.click(getByText('Add Template'));
    const primaryCheckbox = await findByTestId('field-row-primary-0');

    expect(primaryCheckbox).toBeChecked();
  });

  it('does not submit when form has empty field label', async () => {
    const { getByText, findByTestId, props, user } = setup();

    await user.click(getByText('Add Template'));
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');
    await user.click(getByText('Create Template'));

    await waitFor(() => {
      expect(props.onFormSubmit).not.toHaveBeenCalled();
    });
  });

  it('renders with snapshot', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });
});
