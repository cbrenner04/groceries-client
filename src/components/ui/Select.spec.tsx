import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, { type ISelectProps } from './Select';

interface ISetupReturn extends RenderResult {
  select: HTMLSelectElement;
  user: ReturnType<typeof userEvent.setup>;
  props: ISelectProps;
}

describe('Select', () => {
  async function setup(
    suppliedProps?: Partial<
      React.SelectHTMLAttributes<HTMLSelectElement> & {
        label?: string;
        error?: string;
        testId?: string;
        options?: Array<{ value: string; label: string }>;
      }
    >,
  ): Promise<ISetupReturn> {
    const user = userEvent.setup();
    const defaultProps = {
      testId: 'test-select',
      value: '',
      onChange: vi.fn(),
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
      ],
    };
    const props = { ...defaultProps, ...suppliedProps };
    const { container, ...result } = render(<Select {...props} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    return { select, user, props, container, ...result };
  }

  it('renders select with correct attributes', async () => {
    const { select } = await setup({ testId: 'my-select' });
    expect(select).toHaveAttribute('data-test-id', 'my-select');
  });

  it('renders label when provided', async () => {
    const { container } = await setup({ label: 'Choose Option' });
    expect(container.querySelector('label')).toHaveTextContent('Choose Option');
  });

  it('renders all options', async () => {
    const { select } = await setup({
      options: [
        { value: 'one', label: 'Option One' },
        { value: 'two', label: 'Option Two' },
        { value: 'three', label: 'Option Three' },
      ],
    });
    expect(select.querySelectorAll('option')).toHaveLength(3);
    expect(select.querySelectorAll('option')[0]).toHaveTextContent('Option One');
  });

  it('calls onChange handler when selection changes', async () => {
    const handleChange = vi.fn();
    const { select, user } = await setup({
      onChange: handleChange,
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
      ],
    });
    await user.selectOptions(select, 'banana');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', async () => {
    const { container } = await setup({ error: 'Invalid selection' });
    expect(container.textContent).toContain('Invalid selection');
  });

  it('applies error styles to select when error is present', async () => {
    const { container } = await setup({ error: 'Error message' });
    const wrapper = container.querySelector('[class*="tw:border"]');
    expect(wrapper?.className).toContain('tw:border-[var(--color-danger)]');
  });

  it('matches snapshot', async () => {
    const { container } = await setup({
      label: 'Select Item',
      testId: 'item-select',
      options: [
        { value: 'a', label: 'Item A' },
        { value: 'b', label: 'Item B' },
      ],
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
