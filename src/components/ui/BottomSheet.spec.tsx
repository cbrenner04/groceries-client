import React from 'react';
import { act, fireEvent, render, waitFor, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { useDragControls } from 'framer-motion';
import type * as FramerMotion from 'framer-motion';

vi.mock('framer-motion', async (importOriginal: () => Promise<typeof FramerMotion>) => {
  const actual = await importOriginal();
  return { ...actual, useDragControls: vi.fn(actual.useDragControls) };
});

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

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('fits the visible viewport as the keyboard opens, pans, and closes without resetting a draft', async () => {
    vi.stubEnv('PROD', true);
    const viewport = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 });
    vi.stubGlobal('visualViewport', viewport);
    const { getByRole, getByTestId, user } = setup({
      avoidKeyboard: true,
      children: <input aria-label="List name" defaultValue="Groceries" />,
    });
    const overlay = getByRole('dialog');
    const panel = getByTestId('bottom-sheet-panel');
    const input = getByRole('textbox');
    expect(overlay).toHaveStyle({ top: '0px', height: '800px', bottom: 'auto' });
    expect(panel).toHaveStyle({ maxHeight: '720px' });
    await user.clear(input);
    await user.type(input, 'Weekend groceries');
    act(() => {
      viewport.height = 420;
      viewport.offsetTop = 36;
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(overlay).toHaveStyle({ top: '36px', height: '420px' });
    await waitFor(() => expect(panel.style.transform).toBe('none'));
    expect(panel).toHaveStyle({ maxHeight: '378px' });
    act(() => {
      viewport.offsetTop = 64;
      viewport.dispatchEvent(new Event('scroll'));
    });
    expect(overlay).toHaveStyle({ top: '64px' });
    act(() => {
      viewport.height = 800;
      viewport.offsetTop = 0;
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(overlay).toHaveStyle({ top: '0px', height: '800px' });
    expect(panel).toHaveStyle({ maxHeight: '720px' });
    expect(getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('Weekend groceries');
    expect(input).toHaveFocus();
  });

  it('removes viewport listeners on close and measures again on reopen', () => {
    const viewport = Object.assign(new EventTarget(), { height: 420, offsetTop: 36 });
    vi.stubGlobal('visualViewport', viewport);
    const remove = vi.spyOn(viewport, 'removeEventListener');
    const { props, rerender, getByRole, unmount } = setup({ avoidKeyboard: true });
    rerender(<BottomSheet {...props} isOpen={false} />);
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    viewport.height = 800;
    viewport.offsetTop = 0;
    rerender(<BottomSheet {...props} />);
    expect(getByRole('dialog')).toHaveStyle({ top: '0px', height: '800px' });
    unmount();
    expect(remove).toHaveBeenCalledTimes(4);
  });

  it('leaves other sheets unchanged and supports browsers without the viewport API', () => {
    const viewport = Object.assign(new EventTarget(), { height: 420, offsetTop: 36 });
    const subscribe = vi.spyOn(viewport, 'addEventListener');
    vi.stubGlobal('visualViewport', viewport);
    const { props, rerender, getByRole } = setup();
    expect(getByRole('dialog').style.height).toBe('');
    expect(subscribe).not.toHaveBeenCalled();
    vi.stubGlobal('visualViewport', undefined);
    rerender(<BottomSheet {...props} avoidKeyboard />);
    expect(getByRole('dialog')).toBeVisible();
    expect(getByRole('dialog').style.height).toBe('');
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
    const { findByTestId } = setup();
    const dragHandle = await findByTestId('bottom-sheet-drag-handle');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveClass('tw:touch-none');
  });

  it('renders outside the animated page without a competing CSS transform transition', () => {
    const { container, getByRole, getByTestId } = setup();
    expect(getByRole('dialog').parentElement).toBe(document.body);
    expect(container).toBeEmptyDOMElement();
    expect(getByTestId('bottom-sheet-panel')).not.toHaveClass('tw:transition-transform');
    expect(getByTestId('bottom-sheet-panel')).not.toHaveClass('tw:duration-200');
  });

  it('preserves a draft and panel position when form content receives a pointer gesture', async () => {
    vi.stubEnv('PROD', true);
    const { getByRole, getByTestId, props, rerender, user } = setup({
      children: <input aria-label="Item name" defaultValue="Milk" />,
    });
    const input = getByRole('textbox', { name: 'Item name' });
    const panel = getByTestId('bottom-sheet-panel');
    await waitFor(() => expect(panel.style.transform).toBe('none'));
    await user.clear(input);
    await user.type(input, 'Oat milk');
    fireEvent.pointerDown(input, { pointerId: 1, pointerType: 'touch', clientY: 100, button: 0 });
    fireEvent.pointerMove(window, { pointerId: 1, pointerType: 'touch', clientY: 260, buttons: 1 });
    fireEvent.pointerUp(window, { pointerId: 1, pointerType: 'touch', clientY: 260 });
    rerender(<BottomSheet {...props} title="Edit item" />);
    expect(getByRole('textbox', { name: 'Item name' })).toBe(input);
    expect(input).toHaveValue('Oat milk');
    expect(panel.style.transform).toBe('none');
    expect(props.onClose).not.toHaveBeenCalled();
    expect(panel.style.touchAction).not.toBe('none');
  });

  it.each([true, false])('starts drag only from the grip when motion is enabled: %s', (enabled: boolean) => {
    vi.stubEnv('PROD', true);
    matchMediaMock.mockReturnValue({ ...matchMediaMock(), matches: !enabled });
    const { getByTestId, getByText } = setup();
    const controlsResult = vi.mocked(useDragControls).mock.results.at(-1);
    if (controlsResult?.type !== 'return') {
      throw new Error('Expected the sheet to initialize drag controls');
    }
    const start = vi.spyOn(controlsResult.value, 'start');
    fireEvent.pointerDown(getByText('Sheet content'));
    expect(start).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByTestId('bottom-sheet-drag-handle'));
    expect(start).toHaveBeenCalledTimes(enabled ? 1 : 0);
  });

  it('respects prefers-reduced-motion', async () => {
    vi.stubEnv('PROD', true);

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
      dragListener: false,
      dragMomentum: false,
      dragSnapToOrigin: true,
      dragConstraints: { top: 0 },
      dragElastic: 0.2,
    });
    expect(sheetDragProps(false)).toEqual({
      drag: false,
      dragListener: false,
      dragMomentum: false,
      dragSnapToOrigin: true,
      dragConstraints: { top: 0 },
      dragElastic: 0.2,
    });
  });
});
