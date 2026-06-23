import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInput from './DateInput';

interface ISetupReturn extends RenderResult {
  input: HTMLInputElement;
  props: unknown;
  user: ReturnType<typeof userEvent.setup>;
}

describe('DateInput', () => {
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
      testId: 'test-date-input',
      value: '',
      onChange: vi.fn(),
    };
    const props = { ...defaultProps, ...suppliedProps };
    const { container, ...result } = render(<DateInput {...props} />);
    const input = container.querySelector('input') as HTMLInputElement;

    return { input, props, user, container, ...result };
  }

  it('renders input with type date', async () => {
    const { input } = await setup();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('renders input with correct data-test-id', async () => {
    const { input } = await setup({ testId: 'my-date' });
    expect(input).toHaveAttribute('data-test-id', 'my-date');
  });

  it('renders label when provided', async () => {
    const { container } = await setup({ label: 'Birth Date' });
    expect(container.querySelector('label')).toHaveTextContent('Birth Date');
  });

  it('does not render label when not provided', async () => {
    const { container } = await setup({ label: undefined });
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('calls onChange handler when date changes', async () => {
    const handleChange = vi.fn();
    const { input, user } = await setup({ onChange: handleChange });
    await user.type(input, '2024-01-15');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', async () => {
    const { container } = await setup({ error: 'Invalid date' });
    expect(container).toHaveTextContent('Invalid date');
  });

  it('applies error styles when error is present', async () => {
    const { container } = await setup({ error: 'Error message' });
    const wrapper = container.querySelector('[class*="tw:border"]');
    expect(wrapper?.className).toContain('tw:border-[var(--color-danger)]');
  });

  it('handles value prop correctly', async () => {
    const { input } = await setup({ value: '2024-03-15' });
    expect(input).toHaveValue('2024-03-15');
  });

  it('matches snapshot', async () => {
    const { container } = await setup({
      label: 'Start Date',
      testId: 'start-date',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
