import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { Card, type ICardProps } from './Card';

interface ISetupReturn extends RenderResult {
  props: ICardProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<ICardProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ICardProps = {
    children: 'Card content',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Card {...props} />);
  return { ...component, props, user };
}

describe('Card', () => {
  it('renders with default props', () => {
    const { getByText } = setup();
    expect(getByText('Card content')).toBeVisible();
  });

  it('renders default variant with correct base styles', () => {
    const { getByText } = setup();
    const card = getByText('Card content');
    expect(card).toHaveClass('tw:bg-[var(--color-surface-raised)]');
    expect(card).toHaveClass('tw:rounded-[var(--radius-lg)]');
    expect(card).toHaveClass('tw:p-4');
  });

  it('renders interactive variant with hover/active styles', () => {
    const { getByText } = setup({ variant: 'interactive' });
    const card = getByText('Card content');
    expect(card).toHaveClass('tw:cursor-pointer');
    expect(card).toHaveClass('tw:hover:shadow-[var(--shadow-md)]');
  });

  it('does not apply interactive styles for default variant', () => {
    const { getByText } = setup({ variant: 'default' });
    const card = getByText('Card content');
    expect(card).not.toHaveClass('tw:cursor-pointer');
  });

  it('applies selected styles when selected is true', () => {
    const { getByText } = setup({ selected: true });
    const card = getByText('Card content');
    expect(card).toHaveClass('tw:border-[var(--color-primary)]');
    expect(card).toHaveClass('tw:bg-[var(--color-primary-light)]');
  });

  it('does not apply selected styles when selected is false', () => {
    const { getByText } = setup({ selected: false });
    const card = getByText('Card content');
    expect(card).not.toHaveClass('tw:border-[var(--color-primary)]');
  });

  it('applies completed styles when completed is true', () => {
    const { getByText } = setup({ completed: true });
    const card = getByText('Card content');
    expect(card).toHaveClass('tw:opacity-60');
  });

  it('does not apply completed styles when completed is false', () => {
    const { getByText } = setup({ completed: false });
    const card = getByText('Card content');
    expect(card).not.toHaveClass('tw:opacity-60');
  });

  it('handles click events on interactive variant', async () => {
    const handleClick = vi.fn();
    const { getByText, user } = setup({ variant: 'interactive', onClick: handleClick });
    await user.click(getByText('Card content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('accepts additional className prop', () => {
    const { getByText } = setup({ className: 'custom-class' });
    const card = getByText('Card content');
    expect(card).toHaveClass('custom-class');
  });

  it('passes through data-test-id attribute', () => {
    const { getByTestId } = setup({ 'data-test-id': 'test-card' });
    expect(getByTestId('test-card')).toBeVisible();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <span>Child element</span>
      </Card>,
    );
    expect(getByText('Child element')).toBeVisible();
  });
});
