import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

interface ISetupReturn extends RenderResult {
  input: HTMLInputElement;
  props: unknown;
  user: ReturnType<typeof userEvent.setup>;
}

describe('Checkbox', () => {
  async function setup(
    suppliedProps?: Partial<
      Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
        label?: string;
        testId?: string;
      }
    >,
  ): Promise<ISetupReturn> {
    const user = userEvent.setup();
    const defaultProps = {
      label: 'Test Checkbox',
      testId: 'test-checkbox',
      onChange: vi.fn(),
    };
    const props = { ...defaultProps, ...suppliedProps };
    const { container, ...result } = render(<Checkbox {...props} />);
    const input = container.querySelector('input') as HTMLInputElement;

    return { input, props, user, container, ...result };
  }

  it('renders checkbox with label', async () => {
    const { input, container } = await setup({ label: 'Accept Terms' });
    expect(container).toHaveTextContent('Accept Terms');
    expect(input).toBeInTheDocument();
  });

  it('renders checkbox with correct data-test-id', async () => {
    const { input } = await setup({ testId: 'my-checkbox' });
    expect(input).toHaveAttribute('data-test-id', 'my-checkbox');
  });

  it('renders unchecked by default', async () => {
    const { input } = await setup({ checked: undefined });
    expect(input).not.toBeChecked();
  });

  it('renders checked when checked prop is true', async () => {
    const { input } = await setup({ checked: true });
    expect(input).toBeChecked();
  });

  it('calls onChange handler when clicked', async () => {
    const handleChange = vi.fn();
    const { input, user } = await setup({ onChange: handleChange });
    await user.click(input);
    expect(handleChange).toHaveBeenCalled();
  });

  it('maintains checked state from prop', async () => {
    const { input } = await setup({ checked: false });
    expect(input).not.toBeChecked();
    const { input: checkedInput } = await setup({ checked: true });
    expect(checkedInput).toBeChecked();
  });

  it('can be clicked via label', async () => {
    const handleChange = vi.fn();
    const { container, user } = await setup({
      label: 'Click me',
      onChange: handleChange,
    });
    const label = container.querySelector('label');
    if (label) {
      await user.click(label);
    }
    expect(handleChange).toHaveBeenCalled();
  });

  it('matches snapshot when unchecked', async () => {
    const { container } = await setup({ label: 'Test', checked: false });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when checked', async () => {
    const { container } = await setup({ label: 'Test', checked: true });
    expect(container.firstChild).toMatchSnapshot();
  });
});
