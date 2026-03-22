import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { BottomInputBar, type IBottomInputBarProps } from './BottomInputBar';

interface ISetupReturn extends RenderResult {
  props: IBottomInputBarProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBottomInputBarProps> = {}): ISetupReturn {
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
    const { container } = setup();
    const bar = container.firstChild as HTMLElement;
    expect(bar).toHaveClass('tw:fixed');
  });

  it('has accessible label on expand button', async () => {
    const { findByTestId } = setup({ expandedContent: <div>Extra</div> });
    const expandButton = await findByTestId('quick-add-expand');
    expect(expandButton).toHaveAttribute('aria-label');
  });
});
