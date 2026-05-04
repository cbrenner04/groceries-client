import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { showToast } from 'utils/toast';

import TemplatesContainer, { type ITemplatesContainerProps } from './TemplatesContainer';

const mockShowToast = showToast as Mocked<typeof showToast>;

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: ITemplatesContainerProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<ITemplatesContainerProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ITemplatesContainerProps = {
    templates: [
      { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
      { id: 'id2', name: 'book list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
    ],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <TemplatesContainer {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('TemplatesContainer', () => {
  it('renders', () => {
    const { container } = setup();
    expect(container).toMatchSnapshot();
  });

  it('renders with create sheet open', async () => {
    const { container, getByTestId, findByTestId, user } = setup();
    await user.click(getByTestId('add-template-button'));
    expect(await findByTestId('template-form-name')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('displays templates', () => {
    const { getByTestId } = setup();
    expect(getByTestId('template-id1')).toBeVisible();
    expect(getByTestId('template-id2')).toBeVisible();
  });

  it('shows heading', () => {
    const { getAllByText } = setup();
    expect(getAllByText('Templates')[0]).toBeVisible();
  });

  it('renders empty state correctly', () => {
    const { getByText } = setup({ templates: [] });
    expect(getByText('No templates found')).toBeVisible();
  });

  it('opens add template sheet on + Add', async () => {
    const { getByTestId, findByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));

    expect(await findByTestId('template-form-name')).toBeVisible();
  });

  it('creates template on form submit', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: { id: 'id3', name: 'new template', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
    });
    const { getByTestId, getByText, findByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));
    await user.type(await findByTestId('template-form-name'), 'new template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(getByText('Create Template'));

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('Template successfully created.');
    expect(await findByTestId('template-id3')).toBeVisible();
  });

  it('creates fields when creating template', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: { id: 'id3', name: 'new template', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
    });
    const { getByTestId, getByText, findByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));
    await user.type(await findByTestId('template-form-name'), 'new template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(getByText('Create Template'));

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    });

    const calls = (axios.post as Mock).mock.calls;
    expect(calls[0][0]).toBe('/list_item_configurations');
    expect(calls[1][0]).toContain('/list_item_field_configurations');
  });

  it('redirects to signin when 401 on create', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByTestId, getByText, findByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));
    await user.type(await findByTestId('template-form-name'), 'new template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(getByText('Create Template'));

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when create fails', async () => {
    axios.post = vi.fn().mockRejectedValue({
      response: { status: 400, data: { name: 'cannot be blank' } },
    });
    const { getByTestId, getByText, findByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));
    await user.type(await findByTestId('template-form-name'), 'new template');
    await user.type(await findByTestId('field-row-label-0'), 'Field 1');
    await user.click(getByText('Create Template'));

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('name cannot be blank');
  });

  it('deletes template', async () => {
    axios.delete = vi.fn().mockResolvedValue({});
    const { getAllByTestId, findByTestId, user } = setup();

    await user.click(getAllByTestId('template-trash')[0]);
    const confirmButton = await findByTestId('confirm-delete');
    await user.click(confirmButton);

    await act(async () => {
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('Template successfully deleted.');
  });

  it('handles delete failure', async () => {
    axios.delete = vi.fn().mockRejectedValue({ response: { status: 500, data: {} } });
    const { getAllByTestId, findByTestId, user } = setup();

    await user.click(getAllByTestId('template-trash')[0]);
    const confirmButton = await findByTestId('confirm-delete');
    await user.click(confirmButton);

    await act(async () => {
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalled();
  });

  it('opens then cancels the create sheet', async () => {
    const { getByTestId, getByText, queryByTestId, user } = setup();

    await user.click(getByTestId('add-template-button'));
    expect(getByTestId('template-form-name')).toBeVisible();
    await user.click(getByText('Cancel'));

    await waitFor(() => expect(queryByTestId('template-form-name')).not.toBeInTheDocument());
  });

  it('opens edit sheet when an edit button is clicked', async () => {
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
      })
      .mockResolvedValueOnce({ data: [] });

    const { getAllByTestId, findByTestId, user } = setup();

    await user.click(getAllByTestId('template-edit')[0]);
    expect(await findByTestId('template-name')).toBeVisible();
  });

  it('keeps current state when post-edit refresh fetch fails', async () => {
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
      })
      .mockResolvedValueOnce({ data: [] })
      .mockRejectedValueOnce(new Error('boom'));
    axios.put = vi.fn().mockResolvedValue({});

    const { getAllByTestId, findByTestId, findByText, user } = setup();

    await user.click(getAllByTestId('template-edit')[0]);
    const nameInput = await findByTestId('template-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'renamed');
    await user.click(await findByText('Update Template'));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  it('updates the template list after a successful edit', async () => {
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [{ id: 'id1', name: 'updated list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null }],
      });
    axios.put = vi.fn().mockResolvedValue({});

    const { getAllByTestId, findByTestId, findByText, user } = setup();

    await user.click(getAllByTestId('template-edit')[0]);
    const nameInput = await findByTestId('template-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'updated list');
    await user.click(await findByText('Update Template'));

    expect(await findByText('updated list')).toBeVisible();
  });

  it('opens edit sheet when initialEditTemplateId is provided', async () => {
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          id: 'id1',
          name: 'grocery list',
          user_id: 'id1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
      })
      .mockResolvedValueOnce({ data: [] });

    const { findByTestId } = setup({ initialEditTemplateId: 'id1' });

    expect(await findByTestId('template-name')).toBeVisible();
  });
});
