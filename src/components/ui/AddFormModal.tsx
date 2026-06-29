import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface IAddFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  testId?: string;
}

export function AddFormModal(props: IAddFormModalProps): React.JSX.Element | null {
  const { isOpen, onClose, title, children, footer, testId = 'add-form-modal' } = props;
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect((): (() => void) | undefined => {
    if (!isOpen) {
      return undefined;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return (): void => {
      document.body.style.overflow = '';
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect((): (() => void) | undefined => {
    if (!isOpen) {
      return undefined;
    }

    document.addEventListener('keydown', handleKeyDown);
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <>
      <div
        className={
          'tw:fixed tw:inset-0 tw:z-[var(--z-overlay)] tw:bg-black/50 tw:backdrop-blur-sm ' +
          'tw:transition-opacity tw:duration-200'
        }
        onClick={handleOverlayClick}
        data-test-id={`${testId}-overlay`}
      />
      <div
        className="tw:fixed tw:inset-0 tw:z-[var(--z-modal)] tw:flex tw:items-center tw:justify-center tw:p-4"
        onClick={handleOverlayClick}
        data-test-id={testId}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={
            'tw:flex tw:flex-col tw:w-full tw:max-w-lg tw:max-h-[90vh] tw:bg-[var(--color-surface)] ' +
            'tw:rounded-[var(--radius-xl)] tw:shadow-[var(--shadow-xl)] tw:outline-none'
          }
          onClick={(e) => e.stopPropagation()}
          data-test-id={`${testId}-panel`}
        >
          {title ? (
            <div
              className="tw:shrink-0 tw:px-4 tw:py-3 tw:border-b tw:border-[var(--color-border)]"
              data-test-id={`${testId}-title`}
            >
              {typeof title === 'string' ? (
                <h2 className="tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)] tw:m-0">{title}</h2>
              ) : (
                title
              )}
            </div>
          ) : null}
          <div className="tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-3" data-test-id={`${testId}-body`}>
            {children}
          </div>
          {footer ? (
            <div
              className={
                'tw:shrink-0 tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:py-3 ' +
                'tw:border-t tw:border-[var(--color-border)]'
              }
              data-test-id={`${testId}-footer`}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
