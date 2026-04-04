import React from 'react';

import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

export interface IConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string | React.ReactNode;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  cancelText?: string;
  testId?: string;
}

export function ConfirmDialog(props: IConfirmDialogProps): React.JSX.Element {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    body,
    confirmText = 'Confirm',
    confirmVariant = 'danger',
    cancelText = 'Cancel',
    testId,
  } = props;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} testId={testId}>
      <div data-test-id="confirm-modal-body" className="tw:mb-4 tw:text-[var(--color-text-secondary)]">
        {body}
      </div>
      <div className="tw:flex tw:justify-end tw:gap-2">
        <Button variant="ghost" onClick={onClose} data-test-id={`clear-${title}`}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} data-test-id={`confirm-${title}`}>
          {confirmText}
        </Button>
      </div>
    </BottomSheet>
  );
}
