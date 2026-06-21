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

  it('renders form with fields section', async () => {
    const { findByText } = setup();
    expect(await findByText('Fields')).toBeVisible();
  });

  it('updates template name when input changes', async () => {
    const { findByTestId, user } = setup();
    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');

    expect(nameInput).toHaveValue('My Template');
  });

  it('calls onFormSubmit with name and fields when submitted', async () => {
    const { container, findByTestId, props, user } = setup();

    await user.type(await findByTestId('template-form-name'), 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(await findByTestId('add-field-button'));
    await user.type(await findByTestId('field-row-label-1'), 'Field 2');

    const form = container.querySelector('#template-form') as HTMLFormElement;
    await user.click(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(props.onFormSubmit).toHaveBeenCalled();
    });
    const [name, fields] = (props.onFormSubmit as Mock).mock.calls[0];
    expect(name).toBe('My Template');
    expect(fields).toHaveLength(2);
  });

  it('clears form after submission', async () => {
    const { container, findByTestId, user } = setup({
      onFormSubmit: vi.fn().mockResolvedValue(undefined),
    });

    const nameInput = await findByTestId('template-form-name');
    await user.type(nameInput, 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');

    const form = container.querySelector('#template-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('initializes with one default primary field', async () => {
    const { findByTestId } = setup();

    expect(await findByTestId('field-row-label-0')).toBeVisible();
    expect(await findByTestId('field-row-primary-0')).toBeChecked();
  });

  it('does not submit when form has empty field label', async () => {
    const { container, findByTestId, props, user } = setup();
    await user.type(await findByTestId('template-form-name'), 'My Template');

    const form = container.querySelector('#template-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(props.onFormSubmit).not.toHaveBeenCalled();
    });
  });

  it('renders with snapshot', () => {
    const { container } = setup();
    expect(container).toMatchSnapshot();
  });

  it('does not submit when field rows have duplicate positions', async () => {
    const { container, findByTestId, props, user } = setup();

    await user.type(await findByTestId('template-form-name'), 'My Template');
    await user.type(await findByTestId('field-row-label-0'), 'Field One');
    await user.click(await findByTestId('add-field-button'));
    await user.type(await findByTestId('field-row-label-1'), 'Field Two');

    const positionInput = await findByTestId('field-row-position-1');
    fireEvent.change(positionInput, { target: { value: '1' } });

    const form = container.querySelector('#template-form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(props.onFormSubmit).not.toHaveBeenCalled();
    });
  });
});
