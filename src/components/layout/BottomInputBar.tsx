import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  containerClassName,
  inputRowClassName,
  inputClassName,
  footerSubmitClassName,
  footerCancelClassName,
  expandButtonVariants,
  expandedContentVariants,
} from './BottomInputBar.variants';

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
  /** When set, the footer Submit button submits this form (type=submit, form=<id>) instead of calling onSubmit. */
  submitFormId?: string;
  /** Label for the footer Submit button (default "Add"). */
  submitLabel?: string;
  /** Optional controlled value. When provided, the input is controlled by the parent. */
  value?: string;
  /** Called when the input value changes (required for controlled usage). */
  onValueChange?: (value: string) => void;
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
    submitFormId,
    submitLabel = 'Add',
    value: controlledValue,
    onValueChange,
  } = props;

  const [expanded, setExpanded] = useState(initialExpanded);
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (next: string): void => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'building') {
      setExpanded(true);
    }
  }, [mode]);

  // Track keyboard height via visualViewport.
  // On iOS Safari, when the software keyboard opens, window.innerHeight stays
  // constant but visualViewport.height shrinks and visualViewport.offsetTop
  // shifts. We must account for BOTH to correctly pin the bar above the keyboard.
  useEffect(() => {
    const handleViewportChange = (): void => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        // offsetTop > 0 when the visual viewport has scrolled down within the
        // layout viewport (e.g., iOS address-bar auto-hide). Combined with
        // the height shrink this gives the true gap at the bottom.
        const newKeyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        setKeyboardHeight(newKeyboardHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      return (): void => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    }
    return undefined;
  }, []);

  // Publish the bar's rendered height to a CSS custom property so that the
  // scrollable list container (PageLayout's <main>) can add matching bottom
  // padding and prevent the last items from being hidden behind the fixed bar.
  const updateBottomBarHeightVar = useCallback((): void => {
    if (barRef.current) {
      const height = barRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--bottom-bar-height', `${height}px`);
    }
  }, []);

  useEffect(() => {
    // Re-measure whenever expanded state or keyboard height changes.
    updateBottomBarHeightVar();
  }, [expanded, keyboardHeight, updateBottomBarHeightVar]);

  useEffect(() => {
    // Also measure after initial paint so the value is set before first scroll.
    updateBottomBarHeightVar();
    // Clean up on unmount — reset so PageLayout doesn't keep stale padding.
    return (): void => {
      document.documentElement.style.removeProperty('--bottom-bar-height');
    };
  }, [updateBottomBarHeightVar]);

  const handleSubmit = (): void => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
      inputRef.current?.focus();
    }
  };

  const handleCancel = (): void => {
    setValue('');
    setExpanded(false);
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

  const containerStyle: React.CSSProperties = {
    // Pin the bar directly above the on-screen keyboard.
    // When keyboardHeight > 0 (iOS keyboard open) we skip the nav-height offset
    // because the nav bar is itself pushed off-screen by the keyboard; the bar
    // should sit flush on top of the keyboard instead.
    bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 'var(--spacing-nav-height)',
  };

  const expandButtonClassName = expandButtonVariants({ expanded });
  const expandedClassName = expandedContentVariants({ expanded });

  if (hidden) {
    return <></>;
  }

  return (
    <div ref={barRef} className={containerClassName} style={containerStyle}>
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
          aria-label={placeholder}
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
      {expandedContent && (
        <div className={expandedClassName}>
          {expandedContent}
          {expanded && (
            <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-3">
              <button
                type="button"
                onClick={handleCancel}
                className={footerCancelClassName}
                data-test-id="quick-add-cancel"
              >
                Cancel
              </button>
              {submitFormId ? (
                <button
                  type="button"
                  onClick={(): void => {
                    (document.getElementById(submitFormId) as HTMLFormElement | null)?.requestSubmit();
                    inputRef.current?.focus();
                  }}
                  className={footerSubmitClassName}
                  data-test-id="quick-add-submit"
                >
                  {submitLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  className={footerSubmitClassName}
                  data-test-id="quick-add-submit"
                >
                  {submitLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
