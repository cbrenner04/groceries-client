import { cva, type VariantProps } from 'class-variance-authority';

export const containerStyles = 'tw:space-y-4';

export const logoutRowStyles = 'tw:flex tw:justify-end';

export const segmentedControlStyles =
  'tw:flex tw:rounded-[var(--radius-md)] tw:bg-[var(--color-surface-overlay)] tw:p-0.5';

export const themeLabelStyles =
  'tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide ' + 'tw:text-[var(--color-text-secondary)] tw:mb-3';

export const optionVariants = cva(
  'tw:flex-1 tw:text-center tw:text-sm tw:py-1.5 tw:px-2 tw:rounded-[var(--radius-sm)] ' +
    'tw:cursor-pointer tw:transition-colors tw:duration-150 ' +
    'tw:focus-visible:outline-none tw:focus-visible:ring-2 ' +
    'tw:focus-visible:ring-[var(--color-primary)]',
  {
    variants: {
      active: {
        true: 'tw:bg-[var(--color-surface)] tw:text-[var(--color-text-primary)] tw:font-medium tw:shadow-sm',
        false: 'tw:text-[var(--color-text-secondary)] tw:hover:text-[var(--color-text-primary)]',
      },
    },
  },
);

export type OptionVariantProps = VariantProps<typeof optionVariants>;
