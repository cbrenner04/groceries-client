// Convention: colocated Tailwind class strings live in a `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17). ListItemRow's
// state-driven visuals are framer-motion animation props (not className), so all
// className strings here are static named consts rather than cva() definitions.
// All Tailwind classes keep the `tw:` prefix required by this project's config.

export const selectCheckbox = 'tw:w-5 tw:h-5 tw:cursor-pointer tw:flex-shrink-0';

export const actionButtonsContainer = 'tw:flex tw:items-center tw:gap-1';

export const cardClassName = 'tw:flex tw:items-center tw:gap-3';

export const contentColumn = 'tw:flex-1 tw:min-w-0';

export const contentRow = 'tw:flex tw:items-center tw:justify-between tw:gap-2';

export const primaryText = 'tw:text-base tw:font-medium tw:truncate';

export const secondaryText = 'tw:text-sm tw:text-[var(--color-text-secondary)] tw:truncate tw:mt-0.5';

export const secondarySeparator = 'tw:mx-1';

export const categoryWrapper = 'tw:mt-1';

export const actionsColumn = 'tw:flex-shrink-0';
