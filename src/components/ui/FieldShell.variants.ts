import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.

/**
 * Shared classes for the borderless control (input/select) that sits inside a
 * FieldShell. The shell owns the border, rounding, surface fill, and the
 * notched label; the control is transparent and fills the box.
 *
 * Exported as a plain string (via `cva(...)()`) so consumers (Input, Select,
 * DateInput, NumberInput) can concatenate it into their className unchanged.
 */
export const fieldControlStyles = cva(
  'tw:w-full tw:h-11 tw:px-4 tw:bg-transparent tw:border-0 tw:outline-none tw:text-base ' +
    'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
    'tw:focus:ring-[var(--color-primary)]/30',
)();

export const fieldShellWrapperVariants = cva(
  'tw:relative tw:border tw:rounded-[var(--radius-lg)] tw:bg-[var(--color-surface)] tw:transition-colors',
  {
    variants: {
      error: {
        true: 'tw:border-[var(--color-danger)]',
        false: 'tw:border-[var(--color-border)]',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

export const fieldShellLabelStyles =
  'tw:absolute tw:-top-2 tw:left-3 tw:px-1 tw:bg-[var(--color-surface)] ' +
  'tw:text-xs tw:font-medium tw:text-[var(--color-text-secondary)]';
