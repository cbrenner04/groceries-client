import React, { useRef, useState, useEffect } from 'react';

export type BottomInputBarMode = 'building' | 'shopping' | 'neutral';

export interface IBottomInputBarProps {
  onSubmit: (value: string, fields?: Record<string, unknown>) => void;
  placeholder?: string;
  expandedContent?: React.ReactNode;
  initialExpanded?: boolean;
  autoCollapseOnComplete?: boolean;
  onInputFocus?: () => void;
  hidden?: boolean;
  /** Lists page: Enter must submit after choosing a template while the bar is expanded (focus also expands). */
  allowEnterSubmitWhenExpanded?: boolean;
  /** Session mode for mode-driven expansion state. */
  mode?: BottomInputBarMode;
}

export function BottomInputBar(props: IBottomInputBarProps): React.JSX.Element {
  const {
    onSubmit,
    placeholder = 'Add an item...',
    expandedContent,
    initialExpanded = false,
    onInputFocus,
    hidden = false,
    allowEnterSubmitWhenExpanded = false,
    mode = 'neutral',
  } = props;

  const [expanded, setExpanded] = useState(initialExpanded);
  const [value, setValue] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'building') {
      setExpanded(true);
    }
  }, [mode]);

  useEffect(() => {
    const handleResize = (): void => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const windowHeight = window.innerHeight;
        const viewportHeight = viewport.height;
        const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight);
        setKeyboardHeight(newKeyboardHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return (): void => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
    return undefined;
  }, []);

  const handleSubmit = (): void => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    // When the expanded quick-add form is open, Enter should not run single-line quick-add (avoids orphan items).
    if (expanded && expandedContent && !allowEnterSubmitWhenExpanded) {
      return;
    }
    handleSubmit();
  };

  const toggleExpand = (): void => {
    setExpanded((prev) => !prev);
  };

  const containerClassName =
    'tw:fixed tw:left-0 tw:right-0 tw:z-[var(--z-sticky)] ' +
    'tw:bg-[var(--color-surface-raised)] tw:border-t tw:border-[var(--color-border)] ' +
    'tw:shadow-sm tw:transition-all tw:duration-300';

  const inputRowClassName = 'tw:flex tw:items-center tw:gap-2 tw:px-4 ' + 'tw:h-[var(--spacing-input-bar-height)]';

  const containerStyle: React.CSSProperties = {
    bottom: `calc(var(--spacing-nav-height) + ${keyboardHeight}px)`,
  };

  const inputClassName =
    'tw:flex-1 tw:h-10 tw:px-3 tw:rounded-[var(--radius-md)] ' +
    'tw:bg-[var(--color-surface)] tw:border tw:border-[var(--color-border)] ' +
    'tw:text-[var(--color-text-primary)] tw:placeholder-[var(--color-text-tertiary)] ' +
    'tw:text-sm tw:outline-none ' +
    'tw:focus:border-[var(--color-border-strong)] tw:focus:ring-2 tw:focus:ring-[var(--color-primary)]/30';

  const expandButtonClassName =
    'tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded-lg tw:text-[var(--color-text-secondary)] ' +
    'tw:hover:bg-[var(--color-surface-overlay)] tw:cursor-pointer tw:transition-all tw:duration-200 ' +
    (expanded ? 'tw:rotate-180' : '');

  const expandedClassName =
    'tw:overflow-y-auto tw:transition-all tw:duration-200 ' +
    (expanded
      ? 'tw:max-h-[60vh] tw:px-4 tw:pb-[calc(1rem+env(safe-area-inset-bottom))]'
      : 'tw:max-h-0 tw:overflow-hidden');

  if (hidden) {
    return <></>;
  }

  return (
    <div className={containerClassName} style={containerStyle}>
      <div className={inputRowClassName}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setExpanded(true);
            onInputFocus?.();
          }}
          placeholder={placeholder}
          className={inputClassName}
          data-test-id="quick-add-input"
        />
        {expandedContent && (
          <button
            type="button"
            onClick={toggleExpand}
            className={expandButtonClassName}
            data-test-id="quick-add-expand"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 12.5L10 7.5L15 12.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      {expandedContent && <div className={expandedClassName}>{expandedContent}</div>}
    </div>
  );
}
