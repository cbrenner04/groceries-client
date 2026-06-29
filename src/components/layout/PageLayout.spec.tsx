import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { PageLayout, type IPageLayoutProps } from './PageLayout';

interface ISetupReturn extends RenderResult {
  props: IPageLayoutProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IPageLayoutProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IPageLayoutProps = {
    children: <div>Page content</div>,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <PageLayout {...props} />
    </MemoryRouter>,
  );
  return { ...component, props, user };
}

describe('PageLayout', () => {
  it('renders children content', async () => {
    const { findByText } = setup();
    expect(await findByText('Page content')).toBeVisible();
  });

  it('renders title when provided', async () => {
    const { findByTestId } = setup({ title: 'My Page' });
    const title = await findByTestId('page-title');
    expect(title).toHaveTextContent('My Page');
  });

  it('does not render header when no title, back button, or headerRight', () => {
    const { queryByRole } = setup();
    expect(queryByRole('banner')).not.toBeInTheDocument();
  });

  it('renders header when title is provided', async () => {
    const { findByRole } = setup({ title: 'Test' });
    expect(await findByRole('banner')).toBeVisible();
  });

  it('renders back button when showBackButton is true', async () => {
    const { findByTestId } = setup({ showBackButton: true, title: 'Page' });
    expect(await findByTestId('back-button')).toBeVisible();
  });

  it('renders back button as link when backTo is provided', async () => {
    const { findByTestId } = setup({ showBackButton: true, backTo: '/lists', title: 'Page' });
    const backButton = await findByTestId('back-button');
    expect(backButton.tagName).toBe('A');
    expect(backButton).toHaveAttribute('href', '/lists');
  });

  it('renders back button as button when onBack is provided', async () => {
    const onBack = vi.fn();
    const { findByTestId, user } = setup({ showBackButton: true, onBack, title: 'Page' });
    const backButton = await findByTestId('back-button');
    expect(backButton.tagName).toBe('BUTTON');
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when showBackButton is false', () => {
    const { queryByTestId } = setup({ title: 'Page' });
    expect(queryByTestId('back-button')).not.toBeInTheDocument();
  });

  it('renders headerRight content', async () => {
    const { findByText } = setup({ title: 'Page', headerRight: <button type="button">Edit</button> });
    expect(await findByText('Edit')).toBeVisible();
  });

  it('has back button with accessible label', async () => {
    const { findByTestId } = setup({ showBackButton: true, title: 'Page' });
    const backButton = await findByTestId('back-button');
    expect(backButton).toHaveAttribute('aria-label', 'Go back');
  });

  it('renders sticky header', async () => {
    const { findByRole } = setup({ title: 'Test' });
    const header = await findByRole('banner');
    expect(header).toHaveClass('tw:sticky');
  });
});
