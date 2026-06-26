import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { BottomInputBar, type IBottomInputBarProps } from './BottomInputBar';
import { BOTTOM_INPUT_BAR_PORTAL_TARGET_ID } from '../../AppRouter';

interface ISetupReturn extends RenderResult {
  props: IBottomInputBarProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBottomInputBarProps> = {}): ISetupReturn {
  // Create the portal target before rendering
  const portalTarget = document.createElement('div');
  portalTarget.id = BOTTOM_INPUT_BAR_PORTAL_TARGET_ID;
  document.body.appendChild(portalTarget);

  const user = userEvent.setup();
  const defaultProps: IBottomInputBarProps = {
    onSubmit: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<BottomInputBar {...props} />);
  return { ...component, props, user };
}

describe('BottomInputBar', () => {
  it('renders input with data-test-id', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('quick-add-input')).toBeVisible();
  });

  it('renders with default placeholder', async () => {
    const { findByTestId } = setup();
    const input = await findByTestId('quick-add-input');
    expect(input).toHaveAttribute('placeholder', 'Add an item...');
  });

  it('renders with custom placeholder', async () => {
    const { findByTestId } = setup({ placeholder: 'What do you need?' });
    const input = await findByTestId('quick-add-input');
    expect(input).toHaveAttribute('placeholder', 'What do you need?');
  });

  it('exposes default accessible name matching default placeholder', async () => {
    const { getByLabelText } = setup();
    expect(getByLabelText('Add an item...')).toBeInTheDocument();
  });

  it('exposes custom accessible name matching custom placeholder', async () => {
    const { getByLabelText } = setup({ placeholder: 'What do you need?' });
    expect(getByLabelText('What do you need?')).toBeInTheDocument();
  });

  it('calls onSubmit on Enter key with trimmed value', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({ onSubmit });
    const input = await findByTestId('quick-add-input');
    await user.type(input, '  Milk  {Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Milk');
  });

  it('clears input after submit', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({ onSubmit });
    const input = await findByTestId('quick-add-input');
    await user.type(input, 'Bread{Enter}');
    expect(input).toHaveValue('');
  });

  it('does not call onSubmit when input is empty', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({ onSubmit });
    const input = await findByTestId('quick-add-input');
    await user.type(input, '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when input is only whitespace', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({ onSubmit });
    const input = await findByTestId('quick-add-input');
    await user.type(input, '   {Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not render expand button when no expandedContent', () => {
    const { queryByTestId } = setup();
    expect(queryByTestId('quick-add-expand')).not.toBeInTheDocument();
  });

  it('renders expand button when expandedContent is provided', async () => {
    const { findByTestId } = setup({ expandedContent: <div>Extra fields</div> });
    expect(await findByTestId('quick-add-expand')).toBeVisible();
  });

  it('toggles expanded state on expand button click', async () => {
    const { findByTestId, findByText, user } = setup({
      expandedContent: <div>Extra fields</div>,
      initialExpanded: false,
    });
    const expandButton = await findByTestId('quick-add-expand');

    await user.click(expandButton);
    expect(await findByText('Extra fields')).toBeVisible();
  });

  it('starts expanded when initialExpanded is true', async () => {
    const { findByText } = setup({
      expandedContent: <div>Extra fields</div>,
      initialExpanded: true,
    });
    expect(await findByText('Extra fields')).toBeVisible();
  });

  it('has fixed positioning', async () => {
    setup();
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    const bar = portalTarget?.firstChild as HTMLElement;
    expect(bar).toHaveClass('tw:fixed');
  });

  it('does not render when hidden', () => {
    const { queryByTestId } = setup({ hidden: true });
    expect(queryByTestId('quick-add-input')).not.toBeInTheDocument();
  });

  it('has accessible label on expand button', async () => {
    const { findByTestId } = setup({ expandedContent: <div>Extra</div> });
    const expandButton = await findByTestId('quick-add-expand');
    expect(expandButton).toHaveAttribute('aria-label');
  });

  it('has bottom offset that includes safe-area-inset-bottom', async () => {
    setup();
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    const bar = portalTarget?.firstChild as HTMLElement;
    const style = bar.getAttribute('style');
    // jsdom doesn't resolve env(safe-area-inset-bottom), so we verify the calc() is present
    expect(style).toContain('calc(var(--spacing-nav-height) + env(safe-area-inset-bottom))');
  });

  it('does not submit on Enter when expanded by default', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({
      onSubmit,
      expandedContent: <div>Extra fields</div>,
      initialExpanded: true,
    });
    const input = await findByTestId('quick-add-input');
    await user.type(input, 'Milk{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits on Enter when expanded if allowEnterSubmitWhenExpanded', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({
      onSubmit,
      expandedContent: <div>Extra fields</div>,
      initialExpanded: true,
      allowEnterSubmitWhenExpanded: true,
    });
    const input = await findByTestId('quick-add-input');
    await user.type(input, 'Milk{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Milk');
  });

  it('footer Submit calls onSubmit with the input value', async () => {
    const onSubmit = vi.fn();
    const { findByTestId, user } = setup({
      onSubmit,
      expandedContent: <div>Extra fields</div>,
      initialExpanded: true,
    });
    await user.type(await findByTestId('quick-add-input'), 'Milk');
    await user.click(await findByTestId('quick-add-submit'));
    expect(onSubmit).toHaveBeenCalledWith('Milk');
  });

  it('footer renders a custom submit label', async () => {
    const { findByTestId } = setup({
      expandedContent: <div>Extra</div>,
      initialExpanded: true,
      submitLabel: 'Create',
    });
    expect(await findByTestId('quick-add-submit')).toHaveTextContent('Create');
  });

  it('footer Cancel clears the input and collapses', async () => {
    const { findByTestId, queryByTestId, user } = setup({
      expandedContent: <div>Extra fields</div>,
      initialExpanded: true,
    });
    const input = (await findByTestId('quick-add-input')) as HTMLInputElement;
    await user.type(input, 'Milk');
    await user.click(await findByTestId('quick-add-cancel'));
    expect(input.value).toBe('');
    expect(queryByTestId('quick-add-cancel')).not.toBeInTheDocument();
  });

  it('footer Submit requests submission of the associated form when submitFormId is set', async () => {
    const onFormSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { findByTestId, user } = setup({
      submitFormId: 'assoc-form',
      initialExpanded: true,
      expandedContent: (
        <form id="assoc-form" onSubmit={onFormSubmit}>
          <input aria-label="field" />
        </form>
      ),
    });
    await user.click(await findByTestId('quick-add-submit'));
    expect(onFormSubmit).toHaveBeenCalled();
  });

  it('footer Submit is a no-op when the associated form is absent', async () => {
    const { findByTestId, user } = setup({
      submitFormId: 'missing-form',
      initialExpanded: true,
      expandedContent: <div>no form here</div>,
    });
    await user.click(await findByTestId('quick-add-submit'));
    // no throw — the optional-chained requestSubmit short-circuits when the form is absent
    expect(await findByTestId('quick-add-input')).toBeInTheDocument();
  });

  it('focus is moved to input after expanded form submit button click', async () => {
    const { findByTestId, user } = setup({
      submitFormId: 'assoc-form',
      initialExpanded: true,
      expandedContent: (
        <form id="assoc-form" onSubmit={(e) => e.preventDefault()}>
          <input aria-label="field" />
        </form>
      ),
    });
    const input = (await findByTestId('quick-add-input')) as HTMLInputElement;
    const submitButton = await findByTestId('quick-add-submit');

    await user.click(submitButton);

    expect(document.activeElement).toBe(input);
  });

  describe('controlled value', () => {
    it('renders the controlled value and reports changes via onValueChange', async () => {
      const onValueChange = vi.fn();
      const { findByTestId, user } = setup({ value: 'milk', onValueChange });
      const input = (await findByTestId('quick-add-input')) as HTMLInputElement;
      expect(input.value).toBe('milk');

      await user.type(input, 'x');
      // Controlled: the parent owns the value, so each keystroke is reported, not stored internally.
      expect(onValueChange).toHaveBeenCalledWith('milkx');
    });

    it('clears the controlled value via onValueChange on submit', async () => {
      const onSubmit = vi.fn();
      const onValueChange = vi.fn();
      const { findByTestId, user } = setup({ value: 'eggs', onSubmit, onValueChange });
      const input = await findByTestId('quick-add-input');
      await user.type(input, '{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('eggs');
      expect(onValueChange).toHaveBeenCalledWith('');
    });
  });

  it('does not animate the bottom offset on keyboard height changes', async () => {
    setup();
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    const bar = portalTarget?.firstChild as HTMLElement;
    expect(bar.className).not.toContain('tw:transition-all');
  });

  it('renders inside the portal target outside PageTransition', async () => {
    setup();
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    expect(portalTarget).toBeInTheDocument();
    expect(portalTarget?.firstChild).toBeInTheDocument();
    const bar = portalTarget?.firstChild as HTMLElement;
    expect(bar.className).toContain('tw:fixed');
  });

  it('preserves z-stack token z-sticky', async () => {
    setup();
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    const bar = portalTarget?.firstChild as HTMLElement;
    // z-[var(--z-sticky)] should resolve to the CSS variable value
    expect(bar.className).toContain('tw:z-');
  });
});
