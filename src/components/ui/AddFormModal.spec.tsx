import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, Link } from 'react-router';

import { AddFormModal, type IAddFormModalProps } from './AddFormModal';
import { BottomInputBarFormProvider, useBottomInputBarFormContext } from '../layout/BottomInputBarFormContext';

function setup(suppliedProps: Partial<IAddFormModalProps> = {}): RenderResult & { user: UserEvent } {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const props: IAddFormModalProps = {
    isOpen: true,
    children: <p>Modal content</p>,
    ...suppliedProps,
    onClose: suppliedProps.onClose ?? onClose,
  };
  return { ...render(<AddFormModal {...props} />), user };
}

function ContextProbe(): React.JSX.Element {
  const { addFormModalOpen, setAddFormModalOpen } = useBottomInputBarFormContext();
  return (
    <>
      <span data-test-id="add-form-modal-open-flag">{String(addFormModalOpen)}</span>
      <button type="button" data-test-id="set-add-form-modal-open" onClick={() => setAddFormModalOpen(true)}>
        Open
      </button>
      <button type="button" data-test-id="set-add-form-modal-closed" onClick={() => setAddFormModalOpen(false)}>
        Close
      </button>
      <Link to="/templates" data-test-id="go-templates">
        Templates
      </Link>
    </>
  );
}

function renderWithContext(pathname = '/lists'): ReturnType<typeof render> {
  window.history.pushState({}, '', pathname);
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <BottomInputBarFormProvider>
        <Routes>
          <Route path="/lists" element={<ContextProbe />} />
          <Route path="/templates" element={<ContextProbe />} />
        </Routes>
      </BottomInputBarFormProvider>
    </MemoryRouter>,
  );
}

describe('AddFormModal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders children when open', async () => {
    const { findByText } = setup();
    expect(await findByText('Modal content')).toBeVisible();
  });

  it('does not render when closed', () => {
    const { queryByTestId } = setup({ isOpen: false });
    expect(queryByTestId('add-form-modal')).not.toBeInTheDocument();
  });

  it('renders title and footer when provided', async () => {
    const { findByTestId, findByText } = setup({
      title: 'Add item',
      footer: <button type="button">Save</button>,
    });

    expect(await findByText('Add item')).toBeVisible();
    expect(await findByTestId('add-form-modal-footer')).toBeVisible();
    expect(await findByText('Save')).toBeVisible();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    const { findByTestId, user } = setup({ onClose });
    await user.click(await findByTestId('add-form-modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when panel content is clicked', async () => {
    const onClose = vi.fn();
    const { findByText, user } = setup({ onClose });
    await user.click(await findByText('Modal content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose });
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies backdrop blur on the overlay', async () => {
    const { findByTestId } = setup();
    const overlay = await findByTestId('add-form-modal-overlay');
    expect(overlay.className).toContain('backdrop-blur');
  });

  it('locks body scroll while open and restores on close', async () => {
    const onClose = vi.fn();
    const { rerender } = setup({ onClose });

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<AddFormModal isOpen={false} onClose={onClose} children={<p>Modal content</p>} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('scrolls tall content inside the modal body', async () => {
    const { findByTestId } = setup({
      children: (
        <div style={{ height: '2000px' }} data-test-id="tall-content">
          Tall content
        </div>
      ),
    });

    const body = await findByTestId('add-form-modal-body');
    expect(body.className).toContain('overflow-y-auto');
    expect(await findByTestId('tall-content')).toBeInTheDocument();
  });

  it('exposes dialog semantics and receives initial focus', async () => {
    const { findByTestId } = setup();
    const panel = await findByTestId('add-form-modal-panel');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveFocus();
  });

  it('portals modal content to document.body', async () => {
    const { findByTestId } = setup();
    const modal = await findByTestId('add-form-modal');
    expect(modal.parentElement).toBe(document.body);
  });

  it('keeps focus in a form input across re-renders when onClose is unmemoized', async () => {
    const user = userEvent.setup();
    // Mirror a real consumer: onClose is a fresh closure every render. The open/focus
    // effect must not re-run per keystroke, or it steals focus back to the panel.
    function Harness(): React.JSX.Element {
      const [value, setValue] = React.useState('');
      return (
        <AddFormModal isOpen onClose={() => undefined}>
          <input data-test-id="name" value={value} onChange={(e) => setValue(e.target.value)} />
        </AddFormModal>
      );
    }
    const { findByTestId } = render(<Harness />);
    const input = (await findByTestId('name')) as HTMLInputElement;
    await user.type(input, 'groceries');
    expect(input).toHaveFocus();
    expect(input.value).toBe('groceries');
  });

  describe('context flag lifecycle', () => {
    it('clears addFormModalOpen on route change', async () => {
      const user = userEvent.setup();
      const { findByTestId } = renderWithContext('/lists');

      await user.click(await findByTestId('set-add-form-modal-open'));
      expect(await findByTestId('add-form-modal-open-flag')).toHaveTextContent('true');

      await user.click(await findByTestId('go-templates'));
      expect(await findByTestId('add-form-modal-open-flag')).toHaveTextContent('false');
    });

    it('updates addFormModalOpen when setters are used', async () => {
      const user = userEvent.setup();
      const { findByTestId } = renderWithContext('/lists');

      await user.click(await findByTestId('set-add-form-modal-open'));
      expect(await findByTestId('add-form-modal-open-flag')).toHaveTextContent('true');

      await user.click(await findByTestId('set-add-form-modal-closed'));
      expect(await findByTestId('add-form-modal-open-flag')).toHaveTextContent('false');
    });
  });
});
