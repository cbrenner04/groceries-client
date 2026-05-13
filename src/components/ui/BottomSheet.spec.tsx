import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import {
  BottomSheet,
  createDragEndHandler,
  overlayMotionProps,
  sheetDragProps,
  sheetMotionProps,
  shouldCloseFromDrag,
  type IBottomSheetProps,
} from './BottomSheet';

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
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

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

  it('respects prefers-reduced-motion', async () => {
    matchMediaMock = vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;

    const { findByRole } = setup();

    expect(await findByRole('dialog')).toBeVisible();
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('detects drag-to-dismiss gestures', () => {
    expect(shouldCloseFromDrag({ offset: { y: 140 }, velocity: { y: 0 } })).toBe(true);
    expect(shouldCloseFromDrag({ offset: { y: 0 }, velocity: { y: 600 } })).toBe(true);
    expect(shouldCloseFromDrag({})).toBe(false);
    expect(shouldCloseFromDrag({ offset: {}, velocity: {} })).toBe(false);
    expect(shouldCloseFromDrag({ offset: { y: 20 }, velocity: { y: 100 } })).toBe(false);
  });

  it('creates a drag-end handler that closes only for dismissal gestures', () => {
    const onClose = vi.fn();
    const handleDragEnd = createDragEndHandler(onClose);

    handleDragEnd({}, { offset: { y: 20 }, velocity: { y: 100 } });
    expect(onClose).not.toHaveBeenCalled();

    handleDragEnd({}, { offset: { y: 140 }, velocity: { y: 0 } });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns overlay motion props when animation is enabled', () => {
    expect(overlayMotionProps(true)).toEqual({
      initial: { opacity: 0.01 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    });
    expect(overlayMotionProps(false)).toEqual({});
  });

  it('returns sheet motion props when animation is enabled', () => {
    expect(sheetMotionProps(true)).toEqual({
      initial: { y: '100%' },
      animate: { y: 0 },
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    });
    expect(sheetMotionProps(false)).toEqual({});
  });

  it('returns sheet drag props based on animation state', () => {
    expect(sheetDragProps(true)).toEqual({
      drag: 'y',
      dragListener: true,
      dragConstraints: { top: 0 },
      dragElastic: 0.2,
    });
    expect(sheetDragProps(false)).toEqual({
      drag: false,
      dragListener: false,
      dragConstraints: { top: 0 },
      dragElastic: 0.2,
    });
  });
});
