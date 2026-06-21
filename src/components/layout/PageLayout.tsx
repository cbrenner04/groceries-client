import React from 'react';
import { Link } from 'react-router';

export interface IPageLayoutProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  onBack?: () => void;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function PageLayout(props: IPageLayoutProps): React.JSX.Element {
  const { title, showBackButton = false, backTo, onBack, children, bottomBar, headerRight } = props;

  const hasHeader = title || showBackButton || headerRight;

  const containerClassName = 'tw:flex tw:flex-col tw:min-h-[calc(100vh-var(--spacing-nav-height))]';

  const contentWrapperClassName = 'tw:w-full tw:max-w-2xl tw:mx-auto tw:flex tw:flex-col';

  const brandBarClassName =
    'tw:sticky tw:top-0 tw:z-20 tw:flex tw:items-center tw:px-4 tw:py-2 ' +
    'tw:bg-[var(--color-surface)] tw:border-b tw:border-[var(--color-border)] ' +
    'tw:pt-[max(0.5rem,env(safe-area-inset-top))] ' +
    'tw:pb-2 ' +
    'tw:px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]';

  const headerClassName =
    'tw:sticky tw:z-10 tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-3 ' +
    'tw:bg-[var(--color-surface)] tw:border-b tw:border-[var(--color-border)] ' +
    'tw:px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] ' +
    'tw:top-[calc(2.5rem+max(0.5rem,env(safe-area-inset-top)))]';

  const backButtonClassName =
    'tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded-lg tw:text-[var(--color-text-secondary)] ' +
    'tw:bg-[var(--color-surface-overlay)] tw:border tw:border-[var(--color-border)] ' +
    'tw:hover:bg-[var(--color-border)] tw:cursor-pointer tw:transition-colors';

  const backArrow = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const renderBackButton = (): React.JSX.Element | null => {
    if (!showBackButton) {
      return null;
    }

    if (backTo) {
      return (
        <Link to={backTo} className={backButtonClassName} data-test-id="back-button" aria-label="Go back">
          {backArrow}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={backButtonClassName}
        onClick={onBack}
        data-test-id="back-button"
        aria-label="Go back"
      >
        {backArrow}
      </button>
    );
  };

  const contentClassName = bottomBar
    ? [
        'tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-4',
        'tw:pb-[calc(var(--spacing-input-bar-height)+var(--spacing-nav-height)+var(--spacing-bottom-bar-gap))]',
      ].join(' ')
    : 'tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-4';

  return (
    <div className={containerClassName}>
      <div className={contentWrapperClassName}>
        <div className={brandBarClassName} data-test-id="app-brand">
          <Link
            to="/"
            className="tw:text-base tw:font-semibold tw:text-[var(--color-text-primary)] tw:no-underline"
            aria-label="Groceries home"
          >
            Groceries
          </Link>
        </div>
        {hasHeader && (
          <header className={headerClassName}>
            {renderBackButton()}
            {title && (
              <h1
                className="tw:flex-1 tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)]"
                data-test-id="page-title"
              >
                {title}
              </h1>
            )}
            {headerRight && <div className="tw:ml-auto">{headerRight}</div>}
          </header>
        )}
        <main className={contentClassName}>{children}</main>
      </div>
      {bottomBar}
    </div>
  );
}
