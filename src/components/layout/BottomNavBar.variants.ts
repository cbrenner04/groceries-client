import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.

export const navClassName =
  'tw:fixed tw:bottom-0 tw:left-0 tw:right-0 tw:z-[var(--z-nav)] ' +
  'tw:h-[calc(var(--spacing-nav-height)+env(safe-area-inset-bottom))] tw:bg-[var(--color-surface-raised)] ' +
  'tw:border-t tw:border-[var(--color-border)] ' +
  'tw:shadow-[0_-1px_3px_rgb(0_0_0/0.1)] ' +
  'tw:pb-[env(safe-area-inset-bottom)] ' +
  'tw:flex tw:items-center tw:justify-around';

export const itemVariants = cva(
  'tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-1 ' +
    'tw:min-w-[44px] tw:min-h-[44px] tw:px-3 tw:py-1 ' +
    'tw:no-underline tw:transition-colors tw:duration-200 ' +
    'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]',
  {
    variants: {
      active: {
        true: 'tw:text-[var(--color-primary)]',
        false: 'tw:text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);
