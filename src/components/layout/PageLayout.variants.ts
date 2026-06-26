import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.

export const containerClassName = cva('tw:flex tw:flex-col tw:min-h-[calc(100vh-var(--spacing-nav-height))]')();

export const contentWrapperClassName = cva('tw:w-full tw:max-w-2xl tw:mx-auto tw:flex tw:flex-col')();

export const brandBarClassName = cva(
  'tw:sticky tw:top-0 tw:z-20 tw:flex tw:items-center tw:px-4 tw:py-2 ' +
    'tw:bg-[var(--color-surface)] tw:border-b tw:border-[var(--color-border)] ' +
    'tw:pt-[max(0.5rem,env(safe-area-inset-top))] ' +
    'tw:pb-2 ' +
    'tw:px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]',
)();

export const headerClassName = cva(
  'tw:sticky tw:z-10 tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-3 ' +
    'tw:bg-[var(--color-surface)] tw:border-b tw:border-[var(--color-border)] ' +
    'tw:px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] ' +
    'tw:top-[calc(2rem+max(0.5rem,env(safe-area-inset-top)))]',
)();

export const backButtonClassName = cva(
  'tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded-lg tw:text-[var(--color-text-secondary)] ' +
    'tw:bg-[var(--color-surface-overlay)] tw:border tw:border-[var(--color-border)] ' +
    'tw:hover:bg-[var(--color-border)] tw:cursor-pointer tw:transition-colors',
)();

export const contentClassName = cva('tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-4')();
