import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CategoryField, { type ICategoryFieldProps } from './CategoryField';

const categories = ['Produce', 'Dairy', 'Meat'];

async function setup(suppliedProps?: Partial<ICategoryFieldProps>): Promise<{
  formInput: HTMLInputElement;
  props: ICategoryFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps = {
    handleInput: vi.fn(),
    category: 'Produce',
    categories,
  };
  const props = { ...defaultProps, ...suppliedProps };
  render(<CategoryField {...props} />);
  const formInput = (await screen.findByLabelText('Category')) as HTMLInputElement;

  return { formInput, props, user };
}

describe('CategoryField', () => {
  it('renders combobox input', async () => {
    const { formInput } = await setup();
    const wrapper = formInput.closest('[data-test-id="category-field"]');

    expect(wrapper).toMatchSnapshot();
    expect(formInput).toHaveValue('Produce');
    expect(formInput).toHaveAttribute('role', 'combobox');
  });

  it('renders when no category or categories given', async () => {
    const { formInput } = await setup({
      category: undefined,
      categories: undefined,
    });
    const wrapper = formInput.closest('[data-test-id="category-field"]');

    expect(wrapper).toMatchSnapshot();
    expect(formInput).toHaveValue('');
  });

  it('renders disabled state', async () => {
    const { formInput } = await setup({
      disabled: true,
    });

    expect(formInput).toBeDisabled();
  });

  describe('Suggestions', () => {
    it('shows suggestions on focus', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        const suggestions = screen.getByTestId('category-suggestions');
        expect(suggestions).toBeInTheDocument();
        expect(suggestions.querySelectorAll('[role="option"]')).toHaveLength(3);
      });
    });

    it('filters suggestions by case-insensitive substring match', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);
      await user.clear(formInput);
      await user.type(formInput, 'da');

      await waitFor(() => {
        const suggestions = screen.getByTestId('category-suggestions');
        const options = suggestions.querySelectorAll('[role="option"]');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Dairy');
      });
    });

    it('filters case-insensitively', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);
      await user.clear(formInput);
      await user.type(formInput, 'PRO');

      await waitFor(() => {
        const suggestions = screen.getByTestId('category-suggestions');
        const options = suggestions.querySelectorAll('[role="option"]');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Produce');
      });
    });

    it('hides suggestions when none match', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);
      await user.clear(formInput);
      await user.type(formInput, 'xyz');

      await waitFor(() => {
        const suggestions = screen.queryByTestId('category-suggestions');
        expect(suggestions).not.toBeInTheDocument();
      });
    });

    it('does not show suggestions when disabled', async () => {
      const { formInput, user } = await setup({
        disabled: true,
      });

      await user.click(formInput);

      const suggestions = screen.queryByTestId('category-suggestions');
      expect(suggestions).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates suggestions with arrow keys', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'false');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('navigates up with ArrowUp key', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[2]).toHaveAttribute('aria-selected', 'true');
      });

      await user.keyboard('{ArrowUp}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('does not respond to arrow keys when dropdown is closed', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('category-suggestions')).not.toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      const suggestions = screen.queryByTestId('category-suggestions');
      expect(suggestions).not.toBeInTheDocument();
    });

    it('stops at boundary when navigating down to last item', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[2]).toHaveAttribute('aria-selected', 'true');
      });

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[2]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('wraps around at start when navigating up from -1', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowUp}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('selects suggestion with Enter', async () => {
      const { formInput, props, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}{Enter}');

      await waitFor(() => {
        expect(formInput).toHaveValue('Produce');
        expect(props.handleInput).toHaveBeenCalled();
        expect(screen.queryByTestId('category-suggestions')).not.toBeInTheDocument();
      });
    });

    it('does not select without highlighting when Enter is pressed', async () => {
      const handleInput = vi.fn();
      const { formInput, user } = await setup({ handleInput });

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      const callCountBefore = handleInput.mock.calls.length;
      await user.keyboard('{Enter}');

      expect(handleInput.mock.calls.length).toBe(callCountBefore);
      expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
    });

    it('closes suggestions with Escape', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('category-suggestions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('selects suggestion by click', async () => {
      const { formInput, props, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      const dairyOption = screen.getByText('Dairy');
      await user.click(dairyOption);

      await waitFor(() => {
        expect(formInput).toHaveValue('Dairy');
        expect(props.handleInput).toHaveBeenCalled();
        expect(screen.queryByTestId('category-suggestions')).not.toBeInTheDocument();
      });
    });

    it('accepts free text that does not match any category', async () => {
      const { formInput, props, user } = await setup();

      await user.click(formInput);
      await user.clear(formInput);
      await user.type(formInput, 'NewCategory');

      expect(formInput).toHaveValue('NewCategory');
      expect(props.handleInput).toHaveBeenCalled();
    });
  });

  describe('when value changes', () => {
    it('calls handleInput', async () => {
      const { formInput, props, user } = await setup();
      await user.type(formInput, 'a');

      expect(props.handleInput).toHaveBeenCalled();
    });
  });

  describe('Blur and Focus', () => {
    it('closes suggestions on blur', async () => {
      const { formInput, user } = await setup();

      await user.click(formInput);

      await waitFor(() => {
        expect(screen.getByTestId('category-suggestions')).toBeInTheDocument();
      });

      await user.tab();

      await waitFor(() => {
        expect(screen.queryByTestId('category-suggestions')).not.toBeInTheDocument();
      });
    });

    it('updates value when category prop changes', async () => {
      const { rerender } = render(<CategoryField handleInput={vi.fn()} category="Dairy" categories={categories} />);
      const input = (await screen.findByLabelText('Category')) as HTMLInputElement;

      expect(input).toHaveValue('Dairy');

      rerender(<CategoryField handleInput={vi.fn()} category="Meat" categories={categories} />);

      await waitFor(() => {
        expect(input).toHaveValue('Meat');
      });
    });
  });
});
