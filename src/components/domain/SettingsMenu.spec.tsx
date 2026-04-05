import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { ThemeProvider } from '../ThemeProvider';
import { SettingsMenu, type ISettingsMenuProps } from './SettingsMenu';

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

  it('has menu role', async () => {
    const { findByRole } = setup();
    expect(await findByRole('menu')).toBeVisible();
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
    const menu = await findByTestId('settings-menu');
    await user.click(menu);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders Theme section label', async () => {
    const { findByText } = setup();
    expect(await findByText('Theme')).toBeVisible();
  });
});
