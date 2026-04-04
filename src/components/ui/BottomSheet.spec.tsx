import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { BottomSheet, type IBottomSheetProps } from './BottomSheet';

interface ISetupReturn extends RenderResult {
  props: IBottomSheetProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBottomSheetProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IBottomSheetProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Sheet content</div>,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<BottomSheet {...props} />);
  return { ...component, props, user };
}

describe('BottomSheet', () => {
  it('renders children when open', async () => {
    const { findByText } = setup();
    expect(await findByText('Sheet content')).toBeVisible();
  });

  it('does not render when closed', () => {
    const { queryByText } = setup({ isOpen: false });
    expect(queryByText('Sheet content')).not.toBeInTheDocument();
  });

  it('renders title when provided', async () => {
    const { findByText } = setup({ title: 'Sheet Title' });
    expect(await findByText('Sheet Title')).toBeVisible();
  });

  it('does not render title when not provided', () => {
    const { queryByRole } = setup();
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders with testId', async () => {
    const { findByTestId } = setup({ testId: 'test-sheet' });
    expect(await findByTestId('test-sheet')).toBeVisible();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    const { findByTestId, user } = setup({ testId: 'test-sheet', onClose });
    const overlay = await findByTestId('test-sheet');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when sheet content is clicked', async () => {
    const onClose = vi.fn();
    const { findByText, user } = setup({ onClose });
    const content = await findByText('Sheet content');
    await user.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose });
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has dialog role and aria-modal', async () => {
    const { findByRole } = setup();
    const dialog = await findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal');
  });

  it('renders drag handle on mobile view', async () => {
    const { container } = setup();
    const dragHandle = container.querySelector('.tw\\:w-10.tw\\:h-1');
    expect(dragHandle).toBeInTheDocument();
  });
});
