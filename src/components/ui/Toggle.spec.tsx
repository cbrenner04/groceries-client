import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { Toggle, type IToggleProps } from './Toggle';

interface ISetupReturn extends RenderResult {
  props: IToggleProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IToggleProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IToggleProps = {
    checked: false,
    onChange: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Toggle {...props} />);
  return { ...component, props, user };
}

describe('Toggle', () => {
  it('renders toggle switch', async () => {
    const { findByRole } = setup();
    const toggle = await findByRole('switch');
    expect(toggle).toBeVisible();
  });

  it('reflects checked state', async () => {
    const { findByRole, rerender } = setup({ checked: true });
    let toggle = await findByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    rerender(<Toggle checked={false} onChange={vi.fn()} />);
    toggle = await findByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicked', async () => {
    const handleChange = vi.fn();
    const { findByRole, user } = setup({ checked: false, onChange: handleChange });
    const toggle = await findByRole('switch');
    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with correct value on toggle', async () => {
    const handleChange = vi.fn();
    const { findByRole, user, rerender } = setup({ checked: false, onChange: handleChange });
    const toggle = await findByRole('switch');

    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);

    handleChange.mockClear();

    rerender(<Toggle checked={true} onChange={handleChange} />);
    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('supports keyboard navigation (Enter key)', async () => {
    const handleChange = vi.fn();
    const { findByRole, user } = setup({ checked: false, onChange: handleChange });
    const toggle = await findByRole('switch');

    await user.keyboard('{Enter}');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('supports keyboard navigation (Space key)', async () => {
    const handleChange = vi.fn();
    const { findByRole, user } = setup({ checked: false, onChange: handleChange });
    const toggle = await findByRole('switch');

    toggle.focus();
    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('disables toggle when disabled prop is true', async () => {
    const handleChange = vi.fn();
    const { findByRole, user } = setup({ disabled: true, onChange: handleChange });
    const toggle = await findByRole('switch');
    expect(toggle).toBeDisabled();
    await user.click(toggle);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders optional label', async () => {
    const { findByText } = setup({ label: 'Dark Mode' });
    expect(await findByText('Dark Mode')).toBeVisible();
  });

  it('toggles on label click', async () => {
    const handleChange = vi.fn();
    const { findByText, user } = setup({ label: 'Dark Mode', checked: false, onChange: handleChange });
    const label = await findByText('Dark Mode');
    await user.click(label);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('passes through data-test-id attribute', async () => {
    const { findByTestId } = setup({ testId: 'theme-toggle' });
    expect(await findByTestId('theme-toggle')).toBeVisible();
  });

  it('has correct aria-label', async () => {
    const { findByRole } = setup({ label: 'Test Toggle' });
    const toggle = await findByRole('switch');
    expect(toggle).toHaveAttribute('aria-label', 'Test Toggle');
  });
});
