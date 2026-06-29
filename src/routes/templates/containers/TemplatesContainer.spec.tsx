import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { showToast } from 'utils/toast';
import { BOTTOM_INPUT_BAR_PORTAL_TARGET_ID } from 'AppRouter';
import { BottomInputBarFormProvider } from 'components/layout/BottomInputBarFormContext';

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

async function openCreateModal(findByTestId: RenderResult['findByTestId'], user: UserEvent): Promise<void> {
  await user.click(await findByTestId('templates-create-fab'));
  await findByTestId('create-template-modal');
}

async function submitNewTemplate(findByTestId: RenderResult['findByTestId'], user: UserEvent): Promise<void> {
  const nameInput = await findByTestId('create-template-name-input');
  await user.click(nameInput);
  await user.paste('new template');
  await user.click(await findByTestId('create-template-submit'));
  await act(async () => {
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });
}

function setup(suppliedProps?: Partial<ITemplatesContainerProps>): ISetupReturn {
  const portalTarget = document.createElement('div');
  portalTarget.id = BOTTOM_INPUT_BAR_PORTAL_TARGET_ID;
  document.body.appendChild(portalTarget);

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
      <BottomInputBarFormProvider>
        <TemplatesContainer {...props} />
      </BottomInputBarFormProvider>
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('TemplatesContainer', () => {
  it('renders', () => {
    const { container } = setup();
    expect(container).toMatchSnapshot();
  });

  it('renders the create-template FAB', () => {
    const { getByTestId, queryByTestId } = setup();
    expect(getByTestId('templates-create-fab')).toBeVisible();
    expect(queryByTestId('quick-add-input')).toBeNull();
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

  it('creates a template from the create modal (name + default field)', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: { id: 'id3', name: 'new template', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
    });
    const { findByTestId, queryByTestId, user } = setup();

    await openCreateModal(findByTestId, user);
    await submitNewTemplate(findByTestId, user);

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('Template successfully created.');
    expect(await findByTestId('template-id3')).toBeVisible();
    expect(queryByTestId('create-template-modal')).not.toBeInTheDocument();
  });

  it('creates a default field when creating a template', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: { id: 'id3', name: 'new template', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
    });
    const { findByTestId, user } = setup();

    await openCreateModal(findByTestId, user);
    await submitNewTemplate(findByTestId, user);

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    });

    const calls = (axios.post as Mock).mock.calls;
    expect(calls[0][0]).toBe('/list_item_configurations');
    expect(calls[1][0]).toContain('/list_item_field_configurations');
  });

  it('redirects to signin when 401 on create', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByTestId, user } = setup();

    await openCreateModal(findByTestId, user);
    await submitNewTemplate(findByTestId, user);

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when create fails and keeps modal open', async () => {
    axios.post = vi.fn().mockRejectedValue({
      response: { status: 400, data: { name: 'cannot be blank' } },
    });
    const { findByTestId, user } = setup();

    await openCreateModal(findByTestId, user);
    await submitNewTemplate(findByTestId, user);

    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('name cannot be blank');
    expect(await findByTestId('create-template-modal')).toBeVisible();
    expect((await findByTestId('create-template-name-input')) as HTMLInputElement).toHaveValue('new template');
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

  it('hides create FAB while edit sheet is open', async () => {
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
      })
      .mockResolvedValueOnce({ data: [] });

    const { getAllByTestId, findByTestId, queryByTestId, user } = setup();

    await user.click(getAllByTestId('template-edit')[0]);
    expect(await findByTestId('template-name')).toBeVisible();
    expect(queryByTestId('templates-create-fab')).toBeNull();
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

  async function expectDismissClearsCreateModalName(
    dismiss: (ctx: { user: UserEvent; findByTestId: RenderResult['findByTestId'] }) => Promise<void>,
  ): Promise<void> {
    const { findByTestId, queryByTestId, user } = setup();

    await openCreateModal(findByTestId, user);
    await user.type(await findByTestId('create-template-name-input'), 'test name');
    await dismiss({ user, findByTestId });

    expect(queryByTestId('create-template-modal')).not.toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();

    await openCreateModal(findByTestId, user);
    expect(((await findByTestId('create-template-name-input')) as HTMLInputElement).value).toBe('');
  }

  it('closes create modal on cancel and clears name without creating', async () => {
    await expectDismissClearsCreateModalName(async (ctx) => {
      await ctx.user.click(await ctx.findByTestId('create-template-cancel'));
    });
  });

  it('closes create modal on overlay dismiss and clears name without creating', async () => {
    await expectDismissClearsCreateModalName(async (ctx) => {
      await ctx.user.click(await ctx.findByTestId('create-template-modal-overlay'));
    });
  });

  it('closes create modal on Escape and clears name without creating', async () => {
    await expectDismissClearsCreateModalName(async (ctx) => {
      await ctx.user.keyboard('{Escape}');
    });
  });

  it('does not POST on empty or whitespace-only name', async () => {
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('templates-create-fab'));
    await user.click(await findByTestId('create-template-submit'));
    expect(axios.post).not.toHaveBeenCalled();

    await user.type(await findByTestId('create-template-name-input'), '   ');
    await user.click(await findByTestId('create-template-submit'));
    expect(axios.post).not.toHaveBeenCalled();
  });
});
