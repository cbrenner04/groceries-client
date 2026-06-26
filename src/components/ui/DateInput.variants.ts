import { cva } from 'class-variance-authority';
import { fieldControlStyles } from './FieldShell';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.

/**
 * Date input control classes. The date input has no component-specific Tailwind
 * beyond the shared `fieldControlStyles`, so this is simply that shared string
 * (wrapped via `cva(...)()`) re-exported so the component file stays
 * class-string-free and concatenation lives here.
 */
export const dateInputControlStyles = cva(fieldControlStyles)();
