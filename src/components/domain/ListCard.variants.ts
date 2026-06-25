import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.
export const listCardVariants = cva('tw:flex tw:items-center tw:gap-3', {
  variants: {
    pending: {
      true: 'tw:border-l-4 tw:border-l-[var(--color-warning)]',
      false: '',
    },
  },
  defaultVariants: {
    pending: false,
  },
});
