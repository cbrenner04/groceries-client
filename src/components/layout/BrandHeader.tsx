import React from 'react';

export function BrandHeader(): React.JSX.Element {
  const headerClassName =
    'tw:fixed tw:top-0 tw:left-0 tw:right-0 ' +
    'tw:h-[3rem] tw:bg-[var(--color-surface)] ' +
    'tw:border-b tw:border-[var(--color-border)] ' +
    'tw:shadow-[0_1px_3px_rgb(0_0_0/0.1)] ' +
    'tw:px-4 tw:flex tw:items-center ' +
    'tw:font-semibold tw:text-[var(--color-text-primary)]';

  return (
    <header className={headerClassName} style={{ zIndex: 'var(--z-nav)' }} data-test-id="brand-header">
      Groceries
    </header>
  );
}
