import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

import { Skeleton, type ISkeletonProps } from './Skeleton';

interface ISetupReturn extends RenderResult {
  props: ISkeletonProps;
}

function setup(suppliedProps: Partial<ISkeletonProps> = {}): ISetupReturn {
  const defaultProps: ISkeletonProps = {};
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Skeleton {...props} />);
  return { ...component, props };
}

describe('Skeleton', () => {
  it('renders text variant', async () => {
    const { container } = setup({ variant: 'text' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeVisible();
    expect(skeleton).toHaveClass('tw:animate-pulse');
  });

  it('renders card variant', async () => {
    const { container } = setup({ variant: 'card' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeVisible();
    expect(skeleton).toHaveClass('tw:animate-pulse');
  });

  it('renders circle variant', async () => {
    const { container } = setup({ variant: 'circle' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeVisible();
    expect(skeleton).toHaveClass('tw:rounded-full');
  });

  it('renders list variant with multiple items', async () => {
    const { container } = setup({ variant: 'list', count: 3 });
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBe(3);
  });

  it('applies custom width and height', async () => {
    const { container } = setup({ width: '200px', height: '100px' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle('width: 200px');
    expect(skeleton).toHaveStyle('height: 100px');
  });

  it('applies custom className', async () => {
    const { container } = setup({ className: 'custom-class' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('has pulse animation', async () => {
    const { container } = setup({ variant: 'text' });
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('tw:animate-pulse');
  });

  it('uses surface-overlay color', async () => {
    const { container } = setup();
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('tw:bg-[var(--color-surface-overlay)]');
  });

  it('defaults to text variant', async () => {
    const { container } = setup();
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeVisible();
  });

  it('renders with default count of 1 for list variant', async () => {
    const { container } = setup({ variant: 'list' });
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBe(1);
  });
});
