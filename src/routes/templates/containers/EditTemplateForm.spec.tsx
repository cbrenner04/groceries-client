import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { EListItemFieldType } from 'typings';

import axios from 'utils/api';
import { showToast } from '../../../utils/toast';

import EditTemplateForm, { type IEditTemplateFormProps } from './EditTemplateForm';

const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: IEditTemplateFormProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IEditTemplateFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IEditTemplateFormProps = {
    template: {
      id: 'id1',
      name: 'grocery list',
      user_id: 'id1',
      created_at: '',
      updated_at: '',
      archived_at: null,
    },
    fieldConfigurations: [
      {
        id: 'field1',
        label: 'product',
        data_type: EListItemFieldType.FREE_TEXT,
        position: 1,
        primary: true,
        archived_at: null,
        list_item_configuration_id: 'id1',
        created_at: '',
        updated_at: '',
      },
    ],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <EditTemplateForm {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('EditTemplateForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('displays template name', () => {
    const { getByDisplayValue } = setup();

    expect(getByDisplayValue('grocery list')).toBeVisible();
  });

  it('updates name when changed', async () => {
    const { findByLabelText, user } = setup();

    const nameInput = await findByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'new name');

    expect(nameInput).toHaveValue('new name');
  });

  it('updates template name on submit', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByLabelText, getByText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'new name');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/list_item_configurations/id1', {
        list_item_configuration: { name: 'new name' },
      });
    });
  });

  it('shows success toast on successful update', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    axios.post = jest.fn().mockResolvedValue({});
    const { getByText, user } = setup();

    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.info).toHaveBeenCalledWith('Template successfully updated');
    });
  });

  it('navigates to templates on successful update', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    axios.post = jest.fn().mockResolvedValue({});
    const { getByText, user } = setup();

    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/templates');
    });
  });

  it('creates new fields', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    axios.put = jest.fn().mockResolvedValue({});
    const { getByTestId, getByText, user } = setup();

    await user.click(getByTestId('add-field-button'));
    await user.type(getByTestId('field-row-label-1'), 'new field');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('updates modified fields', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getByTestId, getByText, user } = setup();

    const labelInput = getByTestId('field-row-label-0');
    await user.clear(labelInput);
    await user.type(labelInput, 'updated product');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      const calls = (axios.put as jest.Mock).mock.calls;
      const fieldUpdateCall = calls.find((call) => call[0].includes('list_item_field_configurations'));
      expect(fieldUpdateCall).toBeDefined();
    });
  });

  it('deletes removed fields', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    axios.put = jest.fn().mockResolvedValue({});
    axios.post = jest.fn().mockResolvedValue({});
    const { getByTestId, getByText, user } = setup({
      fieldConfigurations: [
        {
          id: 'field1',
          label: 'product',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 1,
          primary: true,
          archived_at: null,
          list_item_configuration_id: 'id1',
          created_at: '',
          updated_at: '',
        },
        {
          id: 'field2',
          label: 'quantity',
          data_type: EListItemFieldType.NUMBER,
          position: 2,
          primary: false,
          archived_at: null,
          list_item_configuration_id: 'id1',
          created_at: '',
          updated_at: '',
        },
      ],
    });

    await user.click(getByTestId('field-row-remove-1'));
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/list_item_configurations/id1/list_item_field_configurations/field2');
    });
  });

  it('redirects to signin when 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('shows error when template not found (403)', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
      expect(mockNavigate).toHaveBeenCalledWith('/templates');
    });
  });

  it('shows error when template not found (404)', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
      expect(mockNavigate).toHaveBeenCalledWith('/templates');
    });
  });

  it('shows validation errors', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: { status: 400, data: { name: 'is invalid' } },
    });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('name is invalid');
    });
  });

  it('shows generic error when no response', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'error' });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  it('shows error message for unknown errors', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'custom error' });
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'n');
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('custom error');
    });
  });

  it('only updates name if changed', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    axios.post = jest.fn().mockResolvedValue({});
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).not.toHaveBeenCalled();
  });

  it('navigates to templates when cancel button clicked', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/templates');
  });

  it('does not submit when template name is empty', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.click(getByText('Update Template'));

    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });
  });
});
