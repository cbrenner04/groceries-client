import React, { useCallback, useEffect } from 'react';

export interface IBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testId?: string;
}

export function BottomSheet(props: IBottomSheetProps): React.JSX.Element {
  const { isOpen, onClose, title, children, testId } = props;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect((): (() => void) | undefined => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return <></>;
  }

  const overlayClassName =
    'tw:fixed tw:inset-0 tw:z-60 tw:flex tw:items-end tw:justify-center ' +
    'tw:bg-black/50 tw:transition-opacity tw:duration-200 ' +
    'md:tw:items-center';

  const sheetClassName =
    'tw:w-full tw:max-h-[90vh] tw:overflow-y-auto ' +
    'tw:bg-[var(--color-surface)] tw:rounded-t-[var(--radius-xl)] ' +
    'tw:shadow-[var(--shadow-xl)] tw:transition-transform tw:duration-200 ' +
    'tw:pb-[calc(env(safe-area-inset-bottom)+var(--spacing-nav-height)+1rem)] ' +
    'md:tw:max-w-[480px] md:tw:rounded-[var(--radius-xl)]';

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={overlayClassName} onClick={handleOverlayClick} data-test-id={testId} role="dialog" aria-modal>
      <div className={sheetClassName}>
        <div className="tw:flex tw:justify-center tw:pt-2 tw:pb-1 md:tw:hidden">
          <div className="tw:w-10 tw:h-1 tw:rounded-full tw:bg-[var(--color-border)]" />
        </div>
        {title && (
          <div className="tw:px-4 tw:py-3 tw:border-b tw:border-[var(--color-border)]">
            <h2 className="tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)]">{title}</h2>
          </div>
        )}
        <div className="tw:p-4">{children}</div>
      </div>
    </div>
  );
}
