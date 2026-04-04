import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { BottomNavBar, type IBottomNavBarProps } from './BottomNavBar';

interface ISetupReturn extends RenderResult {
  props: IBottomNavBarProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBottomNavBarProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IBottomNavBarProps = {
    currentPath: '/lists',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <BottomNavBar {...props} />
    </MemoryRouter>,
  );
  return { ...component, props, user };
}

describe('BottomNavBar', () => {
  it('renders nav container with data-test-id', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('renders Lists nav item', async () => {
    const { findByTestId } = setup();
    const listsItem = await findByTestId('nav-lists');
    expect(listsItem).toBeVisible();
    expect(listsItem).toHaveTextContent('Lists');
  });

  it('renders Templates nav item', async () => {
    const { findByTestId } = setup();
    const templatesItem = await findByTestId('nav-templates');
    expect(templatesItem).toBeVisible();
    expect(templatesItem).toHaveTextContent('Templates');
  });

  it('renders Invite nav item', async () => {
    const { findByTestId } = setup();
    const inviteItem = await findByTestId('nav-invite');
    expect(inviteItem).toBeVisible();
    expect(inviteItem).toHaveTextContent('Invite');
  });

  it('renders Settings nav item', async () => {
    const { findByTestId } = setup();
    const settingsItem = await findByTestId('nav-settings');
    expect(settingsItem).toBeVisible();
    expect(settingsItem).toHaveTextContent('Settings');
  });

  it('highlights active route for Lists', async () => {
    const { findByTestId } = setup({ currentPath: '/lists' });
    const listsItem = await findByTestId('nav-lists');
    expect(listsItem).toHaveClass('tw:text-[var(--color-primary)]');
  });

  it('highlights active route for Templates', async () => {
    const { findByTestId } = setup({ currentPath: '/templates' });
    const templatesItem = await findByTestId('nav-templates');
    expect(templatesItem).toHaveClass('tw:text-[var(--color-primary)]');
  });

  it('does not highlight inactive items', async () => {
    const { findByTestId } = setup({ currentPath: '/lists' });
    const templatesItem = await findByTestId('nav-templates');
    expect(templatesItem).toHaveClass('tw:text-[var(--color-text-secondary)]');
  });

  it('highlights nested routes correctly', async () => {
    const { findByTestId } = setup({ currentPath: '/lists/123' });
    const listsItem = await findByTestId('nav-lists');
    expect(listsItem).toHaveClass('tw:text-[var(--color-primary)]');
  });

  it('renders nav items as links', async () => {
    const { findByTestId } = setup();
    const listsItem = await findByTestId('nav-lists');
    expect(listsItem.tagName).toBe('A');
    expect(listsItem).toHaveAttribute('href', '/lists');
  });

  it('renders as nav element', async () => {
    const { findByRole } = setup();
    expect(await findByRole('navigation')).toBeVisible();
  });

  it('has fixed positioning', async () => {
    const { findByTestId } = setup();
    const nav = await findByTestId('bottom-nav');
    expect(nav).toHaveClass('tw:fixed');
  });

  it('renders all four nav items', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('nav-lists')).toBeVisible();
    expect(await findByTestId('nav-templates')).toBeVisible();
    expect(await findByTestId('nav-invite')).toBeVisible();
    expect(await findByTestId('nav-settings')).toBeVisible();
  });
});
