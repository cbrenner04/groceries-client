import React, { type ReactNode, type MouseEventHandler, useEffect } from 'react';
import { Button } from './ui/Button';

export interface IConfirmModalProps {
  action: string;
  body: string | ReactNode;
  show: boolean;
  handleConfirm: MouseEventHandler;
  handleClear: () => void;
}

const ConfirmModal: React.FC<IConfirmModalProps> = (props): React.JSX.Element | null => {
  useEffect(() => {
    if (!props.show) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        props.handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, [props.show, props.handleClear]);

  if (!props.show) {
    return null;
  }

  return (
    <>
      <div className="tw:fixed tw:inset-0 tw:z-[1050] tw:bg-black/50" onClick={props.handleClear} />
      <div
        className="tw:fixed tw:inset-0 tw:z-[1055] tw:flex tw:items-center tw:justify-center tw:p-4"
        role="dialog"
        aria-modal="true"
        onClick={props.handleClear}
      >
        <div
          className={'tw:bg-[var(--color-surface)] tw:rounded-lg tw:shadow-xl tw:w-full tw:max-w-lg tw:border-0'}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3"
            style={{ borderBottom: '1px solid #e5e7eb' }}
          >
            <h5 className="tw:text-lg tw:font-medium tw:m-0">Confirm {props.action}</h5>
            <button
              type="button"
              className={
                'tw:text-[var(--color-text-tertiary)] tw:hover:text-[var(--color-text-primary)] ' +
                'tw:text-xl tw:leading-none tw:p-1'
              }
              aria-label="Close"
              onClick={props.handleClear}
            >
              &times;
            </button>
          </div>
          <div className="tw:px-4 tw:py-3" data-test-id="confirm-modal-body">
            {props.body}
          </div>
          <div className="tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:py-3" style={{ borderTop: '1px solid #e5e7eb' }}>
            <Button variant="secondary" onClick={props.handleClear} data-test-id={`clear-${props.action}`}>
              Close
            </Button>
            <Button variant="primary" onClick={props.handleConfirm} data-test-id={`confirm-${props.action}`}>
              Yes, I&apos;m sure.
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
