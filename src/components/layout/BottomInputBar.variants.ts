import { cva } from 'class-variance-authority';

export const containerClassName =
  'tw:fixed tw:left-0 tw:right-0 tw:z-[var(--z-sticky)] ' +
  'tw:bg-[var(--color-surface-raised)] tw:border-t tw:border-[var(--color-border)] ' +
  'tw:shadow-sm';

export const inputRowClassName = 'tw:flex tw:items-center tw:gap-2 tw:px-4 ' + 'tw:h-[var(--spacing-input-bar-height)]';

export const inputClassName =
  'tw:flex-1 tw:h-10 tw:px-3 tw:rounded-[var(--radius-lg)] ' +
  'tw:bg-[var(--color-surface)] tw:border tw:border-[var(--color-border)] ' +
  'tw:text-[var(--color-text-primary)] tw:placeholder-[var(--color-text-tertiary)] ' +
  'tw:text-base tw:outline-none ' +
  'tw:focus:border-[var(--color-border-strong)] tw:focus:ring-2 tw:focus:ring-[var(--color-primary)]/30';

export const footerSubmitClassName =
  'tw:inline-flex tw:items-center tw:justify-center tw:min-h-[44px] tw:px-4 tw:rounded-[var(--radius-lg)] ' +
  'tw:bg-[var(--color-primary)] tw:text-[var(--color-text-inverse)] tw:text-sm tw:font-medium ' +
  'tw:hover:bg-[var(--color-primary-hover)] tw:cursor-pointer tw:transition-colors ' +
  'tw:disabled:opacity-50 tw:disabled:cursor-not-allowed ' +
  'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]';

export const footerCancelClassName =
  'tw:inline-flex tw:items-center tw:justify-center tw:min-h-[44px] tw:px-4 tw:rounded-[var(--radius-lg)] ' +
  'tw:text-[var(--color-text-secondary)] tw:text-sm tw:font-medium ' +
  'tw:hover:bg-[var(--color-surface-overlay)] tw:cursor-pointer tw:transition-colors ' +
  'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]';

export const expandButtonVariants = cva(
  'tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded-[var(--radius-lg)] tw:text-[var(--color-text-secondary)] ' +
    'tw:hover:bg-[var(--color-surface-overlay)] tw:cursor-pointer tw:transition-all tw:duration-200 ',
  {
    variants: {
      expanded: {
        true: 'tw:rotate-180',
        false: '',
      },
    },
    defaultVariants: {
      expanded: false,
    },
  },
);

// Animate the expand/collapse by transitioning the grid track from 0fr to 1fr.
// Unlike animating `max-height` between 0 and a fixed 60vh — which interpolates
// across a range far larger than the real content, producing a visible dead
// zone (most noticeable as lag before a collapse actually starts) and forcing a
// reflow every frame via `transition-all` — grid-template-rows animates to the
// content's *natural* (capped) height, so open and close feel immediate.
export const expandedContentVariants = cva(
  'tw:grid tw:transition-[grid-template-rows] tw:duration-200 tw:ease-out tw:motion-reduce:transition-none',
  {
    variants: {
      expanded: {
        true: 'tw:grid-rows-[1fr]',
        false: 'tw:grid-rows-[0fr]',
      },
    },
    defaultVariants: {
      expanded: false,
    },
  },
);

// The single grid child: must clip (overflow-hidden) and be allowed to shrink
// below its content size (min-h-0) for the 0fr track to collapse it to nothing.
export const expandedContentClipClassName = 'tw:min-h-0 tw:overflow-hidden';

// The actual scrollable content. max-h caps tall forms (scroll within the bar);
// padding lives here so it is clipped away when collapsed.
export const expandedContentInnerClassName =
  'tw:max-h-[60vh] tw:overflow-y-auto tw:px-4 tw:pb-[calc(1rem+env(safe-area-inset-bottom))]';
