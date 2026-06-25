import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { ConfirmDialog, type IConfirmDialogProps } from './ConfirmDialog';

interface ISetupReturn extends RenderResult {
  props: IConfirmDialogProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IConfirmDialogProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IConfirmDialogProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete',
    body: 'Are you sure you want to delete this?',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ConfirmDialog {...props} />);
  return { ...component, props, user };
}

describe('ConfirmDialog', () => {
  it('renders body with confirm-modal-body test id', async () => {
    const { findByTestId } = setup();
    const body = await findByTestId('confirm-modal-body');
    expect(body).toBeVisible();
    expect(body).toHaveTextContent('Are you sure you want to delete this?');
    expect(body).toHaveClass('tw:mb-4', 'tw:text-[var(--color-text-primary)]');
  });

  it('renders footer with correct layout classes', async () => {
    const { container } = setup();
    const footer = container.querySelector('.tw\\:flex.tw\\:justify-end.tw\\:gap-2');
    expect(footer).toHaveClass('tw:flex', 'tw:justify-end', 'tw:gap-2');
  });

  it('renders confirm button with confirm-{action} test id', async () => {
    const { findByTestId } = setup({ title: 'Delete' });
    expect(await findByTestId('confirm-Delete')).toBeVisible();
  });

  it('renders cancel button with clear-{action} test id', async () => {
    const { findByTestId } = setup({ title: 'Delete' });
    expect(await findByTestId('clear-Delete')).toBeVisible();
  });

  it('does not render when closed', () => {
    const { queryByTestId } = setup({ isOpen: false });
    expect(queryByTestId('confirm-modal-body')).not.toBeInTheDocument();
  });

  it('renders title in the header', async () => {
    const { findByText } = setup({ title: 'Remove Item' });
    expect(await findByText('Remove Item')).toBeVisible();
  });

  it('uses default confirm text of "Confirm"', async () => {
    const { findByTestId } = setup();
    const confirmBtn = await findByTestId('confirm-Delete');
    expect(confirmBtn).toHaveTextContent('Confirm');
  });

  it('uses custom confirm text', async () => {
    const { findByTestId } = setup({ confirmText: 'Yes, delete' });
    const confirmBtn = await findByTestId('confirm-Delete');
    expect(confirmBtn).toHaveTextContent('Yes, delete');
  });

  it('uses default cancel text of "Cancel"', async () => {
    const { findByTestId } = setup();
    const cancelBtn = await findByTestId('clear-Delete');
    expect(cancelBtn).toHaveTextContent('Cancel');
  });

  it('uses custom cancel text', async () => {
    const { findByTestId } = setup({ cancelText: 'Never mind' });
    const cancelBtn = await findByTestId('clear-Delete');
    expect(cancelBtn).toHaveTextContent('Never mind');
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const { findByTestId, user } = setup({ onConfirm });
    await user.click(await findByTestId('confirm-Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    const { findByTestId, user } = setup({ onClose });
    await user.click(await findByTestId('clear-Delete'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose });
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with danger variant by default', async () => {
    const { findByTestId } = setup();
    const confirmBtn = await findByTestId('confirm-Delete');
    expect(confirmBtn).toHaveClass('tw:bg-[var(--color-danger)]');
  });

  it('renders with primary variant when specified', async () => {
    const { findByTestId } = setup({ confirmVariant: 'primary' });
    const confirmBtn = await findByTestId('confirm-Delete');
    expect(confirmBtn).toHaveClass('tw:bg-[var(--color-primary)]');
  });

  it('renders body as ReactNode', async () => {
    const { findByTestId } = setup({ body: <span data-test-id="custom-body">Custom content</span> });
    const body = await findByTestId('confirm-modal-body');
    expect(body).toContainElement(await findByTestId('custom-body'));
  });

  it('renders with testId on the dialog', async () => {
    const { findByTestId } = setup({ testId: 'my-confirm-dialog' });
    expect(await findByTestId('my-confirm-dialog')).toBeVisible();
  });

  it('has dialog role and aria-modal', async () => {
    const { findByRole } = setup();
    const dialog = await findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal');
  });
});
