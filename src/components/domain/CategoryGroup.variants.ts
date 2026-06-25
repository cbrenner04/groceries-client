import { cva, type VariantProps } from 'class-variance-authority';

export const headerButtonVariants = cva(
  'tw:flex tw:items-center tw:gap-2 tw:w-full tw:mb-2 tw:group tw:cursor-pointer',
);

export const labelVariants = cva(
  'tw:text-sm tw:font-semibold tw:uppercase tw:tracking-wide ' +
    'tw:text-[var(--color-text-secondary)] tw:whitespace-nowrap',
  {
    variants: {
      uncategorized: {
        true: 'tw:italic',
        false: '',
      },
    },
  },
);

export const dividerVariants = cva('tw:flex-1 tw:h-px tw:bg-[var(--color-border)]');

export const chevronVariants = cva(
  'tw:text-[var(--color-text-tertiary)] tw:text-xs tw:transition-transform tw:duration-200',
  {
    variants: {
      expanded: {
        true: '',
        false: 'tw:-rotate-90',
      },
    },
  },
);

export const childrenContainerVariants = cva('tw:flex tw:flex-col tw:gap-2');

export type LabelVariantProps = VariantProps<typeof labelVariants>;
export type ChevronVariantProps = VariantProps<typeof chevronVariants>;
