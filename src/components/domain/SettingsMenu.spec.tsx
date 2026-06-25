import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { ThemeProvider } from '../ThemeProvider';
import { SettingsMenu, type ISettingsMenuProps } from './SettingsMenu';
import { optionVariants } from './SettingsMenu.variants';

interface ISetupReturn extends RenderResult {
  props: ISettingsMenuProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<ISettingsMenuProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ISettingsMenuProps = {
    isOpen: true,
    onClose: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <ThemeProvider>
      <SettingsMenu {...props} />
    </ThemeProvider>,
  );
  return { ...component, props, user };
}

describe('SettingsMenu', () => {
  it('renders settings-menu container when open', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('settings-menu')).toBeVisible();
  });

  it('does not render when closed', () => {
    const { queryByTestId } = setup({ isOpen: false });
    expect(queryByTestId('settings-menu')).not.toBeInTheDocument();
  });

  it('renders theme-light option', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('theme-light')).toBeVisible();
    expect(await findByTestId('theme-light')).toHaveTextContent('Light');
  });

  it('renders theme-dark option', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('theme-dark')).toBeVisible();
    expect(await findByTestId('theme-dark')).toHaveTextContent('Dark');
  });

  it('renders theme-system option', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('theme-system')).toBeVisible();
    expect(await findByTestId('theme-system')).toHaveTextContent('System');
  });

  it('renders log-out-link', async () => {
    const { findByTestId } = setup();
    const logoutBtn = await findByTestId('log-out-link');
    expect(logoutBtn).toBeVisible();
    expect(logoutBtn).toHaveTextContent('Log out');
  });

  it('has dialog role', async () => {
    const { findByRole } = setup();
    expect(await findByRole('dialog')).toBeVisible();
  });

  it('has radiogroup for theme options', async () => {
    const { findByRole } = setup();
    expect(await findByRole('radiogroup', { name: 'Theme' })).toBeVisible();
  });

  it('theme options have radio role with aria-checked', async () => {
    const { findByTestId } = setup();
    const systemOption = await findByTestId('theme-system');
    expect(systemOption).toHaveAttribute('role', 'radio');
    expect(systemOption).toHaveAttribute('aria-checked', 'true');
  });

  it('changes theme when option is clicked', async () => {
    const { findByTestId, user } = setup();
    const darkOption = await findByTestId('theme-dark');
    await user.click(darkOption);
    expect(darkOption).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    const { container, user } = setup({ onClose });
    const overlay = container.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when menu is clicked', async () => {
    const onClose = vi.fn();
    const { findByTestId, user } = setup({ onClose });
    const themeLabel = await findByTestId('theme-light');
    await user.click(themeLabel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders Theme section label', async () => {
    const { findByText } = setup();
    expect(await findByText('Theme')).toBeVisible();
  });

  it('container has correct spacing classes', async () => {
    const { findByTestId } = setup();
    const settingsMenu = await findByTestId('settings-menu');
    const container = settingsMenu.querySelector('.tw\\:space-y-4');
    expect(container).toHaveClass('tw:space-y-4');
  });

  it('log-out row has correct layout classes', async () => {
    const { findByTestId } = setup();
    const logoutBtn = await findByTestId('log-out-link');
    const logoutRow = logoutBtn.parentElement;
    expect(logoutRow).toHaveClass('tw:flex');
    expect(logoutRow).toHaveClass('tw:justify-end');
  });

  it('segmented-control wrapper has correct classes', async () => {
    const { findByRole } = setup();
    const radiogroup = await findByRole('radiogroup');
    expect(radiogroup).toHaveClass('tw:flex');
    expect(radiogroup).toHaveClass('tw:rounded-[var(--radius-md)]');
    expect(radiogroup).toHaveClass('tw:bg-[var(--color-surface-overlay)]');
    expect(radiogroup).toHaveClass('tw:p-0.5');
  });

  it('theme label has correct classes', async () => {
    const { findByText } = setup();
    const themeLabel = await findByText('Theme');
    expect(themeLabel).toHaveClass('tw:text-xs');
    expect(themeLabel).toHaveClass('tw:font-semibold');
    expect(themeLabel).toHaveClass('tw:uppercase');
    expect(themeLabel).toHaveClass('tw:tracking-wide');
    expect(themeLabel).toHaveClass('tw:text-[var(--color-text-secondary)]');
    expect(themeLabel).toHaveClass('tw:mb-3');
  });

  it('active theme option has active state classes', async () => {
    const { findByTestId } = setup();
    const systemOption = await findByTestId('theme-system');
    expect(systemOption).toHaveClass('tw:bg-[var(--color-surface)]');
    expect(systemOption).toHaveClass('tw:text-[var(--color-text-primary)]');
    expect(systemOption).toHaveClass('tw:font-medium');
    expect(systemOption).toHaveClass('tw:shadow-sm');
  });

  it('inactive theme option has inactive state classes', async () => {
    const { findByTestId } = setup();
    const lightOption = await findByTestId('theme-light');
    expect(lightOption).toHaveClass('tw:text-[var(--color-text-secondary)]');
    expect(lightOption).toHaveClass('tw:hover:text-[var(--color-text-primary)]');
  });

  it('theme options have base styling classes regardless of active state', async () => {
    const { findByTestId } = setup();
    const lightOption = await findByTestId('theme-light');
    const darkOption = await findByTestId('theme-dark');

    expect(lightOption).toHaveClass('tw:flex-1');
    expect(lightOption).toHaveClass('tw:text-center');
    expect(lightOption).toHaveClass('tw:text-sm');
    expect(lightOption).toHaveClass('tw:py-1.5');
    expect(lightOption).toHaveClass('tw:px-2');
    expect(lightOption).toHaveClass('tw:rounded-[var(--radius-sm)]');
    expect(lightOption).toHaveClass('tw:cursor-pointer');
    expect(lightOption).toHaveClass('tw:transition-colors');
    expect(lightOption).toHaveClass('tw:duration-150');
    expect(lightOption).toHaveClass('tw:focus-visible:outline-none');
    expect(lightOption).toHaveClass('tw:focus-visible:ring-2');
    expect(lightOption).toHaveClass('tw:focus-visible:ring-[var(--color-primary)]');

    expect(darkOption).toHaveClass('tw:flex-1');
    expect(darkOption).toHaveClass('tw:text-center');
    expect(darkOption).toHaveClass('tw:text-sm');
  });

  it('switches active state when different theme option is selected', async () => {
    const { findByTestId, user } = setup();
    const lightOption = await findByTestId('theme-light');
    const systemOption = await findByTestId('theme-system');

    expect(lightOption).toHaveClass('tw:text-[var(--color-text-secondary)]');
    expect(systemOption).toHaveClass('tw:bg-[var(--color-surface)]');

    await user.click(lightOption);

    expect(lightOption).toHaveClass('tw:bg-[var(--color-surface)]');
    expect(systemOption).toHaveClass('tw:text-[var(--color-text-secondary)]');
  });

  it('cycles through all theme options and verifies variant states', async () => {
    const { findByTestId, user } = setup();
    const lightOption = await findByTestId('theme-light');
    const darkOption = await findByTestId('theme-dark');
    const systemOption = await findByTestId('theme-system');

    await user.click(darkOption);
    expect(darkOption).toHaveAttribute('aria-checked', 'true');
    expect(darkOption).toHaveClass('tw:bg-[var(--color-surface)]');
    expect(lightOption).toHaveClass('tw:text-[var(--color-text-secondary)]');

    await user.click(systemOption);
    expect(systemOption).toHaveAttribute('aria-checked', 'true');
    expect(systemOption).toHaveClass('tw:bg-[var(--color-surface)]');
    expect(darkOption).toHaveClass('tw:text-[var(--color-text-secondary)]');
  });

  describe('optionVariants cva definition', () => {
    it('returns active variant classes when active is true', () => {
      const classes = optionVariants({ active: true });
      expect(classes).toContain('tw:bg-[var(--color-surface)]');
      expect(classes).toContain('tw:text-[var(--color-text-primary)]');
      expect(classes).toContain('tw:font-medium');
      expect(classes).toContain('tw:shadow-sm');
    });

    it('returns inactive variant classes when active is false', () => {
      const classes = optionVariants({ active: false });
      expect(classes).toContain('tw:text-[var(--color-text-secondary)]');
      expect(classes).toContain('tw:hover:text-[var(--color-text-primary)]');
    });

    it('returns base classes for both active and inactive states', () => {
      const activeClasses = optionVariants({ active: true });
      const inactiveClasses = optionVariants({ active: false });

      expect(activeClasses).toContain('tw:flex-1');
      expect(activeClasses).toContain('tw:text-center');
      expect(activeClasses).toContain('tw:text-sm');
      expect(activeClasses).toContain('tw:py-1.5');
      expect(activeClasses).toContain('tw:px-2');
      expect(activeClasses).toContain('tw:rounded-[var(--radius-sm)]');
      expect(activeClasses).toContain('tw:cursor-pointer');
      expect(activeClasses).toContain('tw:transition-colors');
      expect(activeClasses).toContain('tw:duration-150');

      expect(inactiveClasses).toContain('tw:flex-1');
      expect(inactiveClasses).toContain('tw:text-center');
      expect(inactiveClasses).toContain('tw:text-sm');
    });
  });
});
