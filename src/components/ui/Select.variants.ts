import { cva } from 'class-variance-authority';

// Convention: cva definitions live in a colocated `<Component>.variants.ts`
// sibling so component files stay class-string-free (#17).
// All Tailwind classes keep the `tw:` prefix required by this project's config.

const chevronSvg =
  'data:image/svg+xml;utf8,' +
  '<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20' +
  'stroke=%22%236b7280%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22>' +
  '<polyline%20points=%226%209%2012%2015%2018%209%22></polyline></svg>';

/**
 * Select control-specific classes: appearance override, custom chevron bg,
 * and right padding for the chevron. Exported as a plain string (via `cva(...)()`)
 * so it can be concatenated with fieldControlStyles in the component.
 */
export const selectControlStyles = cva(
  `tw:appearance-none tw:bg-[image:url('${chevronSvg}')] tw:bg-no-repeat tw:bg-right tw:pr-10`,
)();
