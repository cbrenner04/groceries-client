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
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={props.handleClear} />
      <div
        className={
          'relative bg-[var(--color-surface)] rounded-[var(--radius-xl)] ' +
          'shadow-[var(--shadow-xl)] w-full max-w-md mx-4'
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Confirm {props.action}</h2>
          <button
            type="button"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1"
            onClick={props.handleClear}
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>
        <div className="p-4" data-test-id="confirm-modal-body">
          {props.body}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" onClick={props.handleClear} data-test-id={`clear-${props.action}`}>
            Close
          </Button>
          <Button variant="primary" onClick={props.handleConfirm} data-test-id={`confirm-${props.action}`}>
            Yes, I&apos;m sure.
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
