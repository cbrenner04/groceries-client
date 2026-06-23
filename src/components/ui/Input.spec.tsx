import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

interface ISetupReturn extends RenderResult {
  input: HTMLInputElement;
  props: unknown;
  user: ReturnType<typeof userEvent.setup>;
}

describe('Input', () => {
  async function setup(
    suppliedProps?: Partial<
      React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; testId?: string }
    >,
  ): Promise<ISetupReturn> {
    const user = userEvent.setup();
    const defaultProps = {
      testId: 'test-input',
      value: '',
      onChange: vi.fn(),
    };
    const props = { ...defaultProps, ...suppliedProps };
    const { container, ...result } = render(<Input {...props} />);
    const input = container.querySelector('input') as HTMLInputElement;

    return { input, props, user, container, ...result };
  }

  it('renders input with correct attributes', async () => {
    const { input } = await setup({ testId: 'my-input' });
    expect(input).toHaveAttribute('data-test-id', 'my-input');
  });

  it('renders label when provided', async () => {
    const { container } = await setup({ label: 'Test Label' });
    expect(container.querySelector('label')).toHaveTextContent('Test Label');
  });

  it('does not render label when not provided', async () => {
    const { container } = await setup({ label: undefined });
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('calls onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    const { input, user } = await setup({
      testId: 'test-input',
      onChange: handleChange,
    });
    await user.type(input, 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', async () => {
    const { container } = await setup({ error: 'This field is required' });
    expect(container.querySelector("[class*='tw:text-\\[var\\(--color-danger\\)\\]']")).toHaveTextContent(
      'This field is required',
    );
  });

  it('does not render error message when error is not provided', async () => {
    const { container } = await setup({ error: undefined });
    const errorElements = container.querySelectorAll("[class*='tw:text-\\[var\\(--color-danger\\)\\]']");
    expect(errorElements.length).toBe(0);
  });

  it('applies error styles to input when error is present', async () => {
    const { container } = await setup({ error: 'Error message' });
    const wrapper = container.querySelector('[class*="tw:border"]');
    expect(wrapper?.className).toContain('tw:border-[var(--color-danger)]');
  });

  it('renders with custom className', async () => {
    const { input } = await setup({ className: 'tw:custom-class' });
    expect(input.className).toContain('tw:custom-class');
  });

  it('matches snapshot', async () => {
    const { container } = await setup({
      label: 'Email',
      testId: 'email-input',
      placeholder: 'Enter email',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
