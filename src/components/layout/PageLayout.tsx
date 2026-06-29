import React from 'react';
import { Link } from 'react-router';
import {
  containerClassName,
  contentWrapperClassName,
  brandBarClassName,
  headerClassName,
  backButtonClassName,
  contentClassName,
} from './PageLayout.variants';

export interface IPageLayoutProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  onBack?: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function PageLayout(props: IPageLayoutProps): React.JSX.Element {
  const { title, showBackButton = false, backTo, onBack, children, headerRight } = props;

  const hasHeader = title || showBackButton || headerRight;

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
                className="tw:flex-1 tw:text-center tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)]"
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
    </div>
  );
}
