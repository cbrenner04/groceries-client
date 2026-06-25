import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.
export const buttonVariants = cva(
  // base
  'tw:font-medium tw:transition-colors tw:duration-200 tw:ease-in-out ' +
    'tw:min-h-[44px] tw:flex tw:items-center tw:justify-center tw:gap-2 ' +
    'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]',
  {
    variants: {
      variant: {
        primary:
          'tw:bg-[var(--color-primary)] tw:text-white tw:hover:bg-[var(--color-primary-hover)] tw:active:opacity-90',
        secondary:
          'tw:border tw:border-[var(--color-border-strong)] tw:text-[var(--color-text-primary)] ' +
          'tw:hover:bg-[var(--color-surface-overlay)]',
        ghost:
          'tw:text-[var(--color-text-secondary)] tw:hover:bg-[var(--color-surface-overlay)] ' +
          'tw:active:bg-[var(--color-surface-raised)]',
        'ghost-danger':
          'tw:text-[var(--color-danger)] tw:hover:bg-[var(--color-surface-overlay)] ' +
          'tw:active:bg-[var(--color-surface-raised)]',
        danger:
          'tw:bg-[var(--color-danger)] tw:text-white tw:hover:bg-[var(--color-danger-hover)] tw:active:opacity-90',
        success: 'tw:bg-[var(--color-success)] tw:text-white tw:hover:opacity-90 tw:active:opacity-80',
      },
      size: {
        sm: 'tw:h-8 tw:px-3 tw:text-sm tw:rounded-[var(--radius-lg)]',
        md: 'tw:h-10 tw:px-4 tw:text-sm tw:rounded-[var(--radius-lg)]',
        lg: 'tw:h-12 tw:px-6 tw:text-base tw:rounded-[var(--radius-lg)]',
      },
      fullWidth: {
        true: 'tw:w-full',
        false: '',
      },
      disabled: {
        true: 'tw:opacity-50 tw:cursor-not-allowed tw:pointer-events-none',
        false: 'tw:cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      disabled: false,
    },
  },
);

// Loading spinner shown inside the button; not a variant, so kept as a static
// string alongside the cva def to keep the component file class-string-free.
export const buttonSpinnerStyles =
  'tw:inline-block tw:h-4 tw:w-4 tw:animate-spin tw:rounded-full ' +
  'tw:border-2 tw:border-current tw:border-t-transparent';
