import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberInput from './NumberInput';

interface ISetupReturn extends RenderResult {
  input: HTMLInputElement;
  props: unknown;
  user: ReturnType<typeof userEvent.setup>;
}

describe('NumberInput', () => {
  async function setup(
    suppliedProps?: Partial<
      React.InputHTMLAttributes<HTMLInputElement> & {
        label?: string;
        error?: string;
        testId?: string;
      }
    >,
  ): Promise<ISetupReturn> {
    const user = userEvent.setup();
    const defaultProps = {
      testId: 'test-number-input',
      value: '',
      onChange: vi.fn(),
    };
    const props = { ...defaultProps, ...suppliedProps };
    const { container, ...result } = render(<NumberInput {...props} />);
    const input = container.querySelector('input') as HTMLInputElement;

    return { input, props, user, container, ...result };
  }

  it('renders input with type number', async () => {
    const { input } = await setup();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('renders input with correct data-test-id', async () => {
    const { input } = await setup({ testId: 'my-number' });
    expect(input).toHaveAttribute('data-test-id', 'my-number');
  });

  it('renders label when provided', async () => {
    const { container } = await setup({ label: 'Quantity' });
    expect(container.querySelector('label')).toHaveTextContent('Quantity');
  });

  it('does not render label when not provided', async () => {
    const { container } = await setup({ label: undefined });
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('calls onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    const { input, user } = await setup({ onChange: handleChange });
    await user.type(input, '42');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', async () => {
    const { container } = await setup({ error: 'Must be a positive number' });
    expect(container).toHaveTextContent('Must be a positive number');
  });

  it('applies error styles when error is present', async () => {
    const { container } = await setup({ error: 'Error message' });
    const wrapper = container.querySelector('[class*="tw:border"]');
    expect(wrapper?.className).toContain('tw:border-[var(--color-danger)]');
  });

  it('handles value prop with number', async () => {
    const { input } = await setup({ value: 10 });
    expect(input).toHaveValue(10);
  });

  it('defaults to empty string when value is undefined', async () => {
    const { input } = await setup({ value: undefined });
    expect(input).toHaveValue(null);
  });

  it('respects min and max attributes', async () => {
    const { input } = await setup({ min: 0, max: 100 });
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('matches snapshot', async () => {
    const { container } = await setup({
      label: 'Count',
      testId: 'count-input',
      min: 1,
      max: 100,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
