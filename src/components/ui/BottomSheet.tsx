import React, { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';

export interface IBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testId?: string;
}

export interface IDragInfo {
  offset?: { y?: number };
  velocity?: { y?: number };
}

const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function shouldCloseFromDrag(info: IDragInfo): boolean {
  const draggedDown = (info.offset?.y ?? 0) > 100;
  const dragVelocityDown = (info.velocity?.y ?? 0) > 500;

  return draggedDown || dragVelocityDown;
}

export function overlayMotionProps(shouldAnimate: boolean): MotionProps {
  if (!shouldAnimate) {
    return {};
  }

  return {
    initial: { opacity: 0.01 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  };
}

export function sheetMotionProps(shouldAnimate: boolean): MotionProps {
  if (!shouldAnimate) {
    return {};
  }

  return {
    initial: { y: '100%' },
    animate: { y: 0 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  };
}

export function sheetDragProps(shouldAnimate: boolean): MotionProps {
  return {
    drag: shouldAnimate ? 'y' : false,
    dragListener: shouldAnimate,
    dragConstraints: { top: 0 },
    dragElastic: 0.2,
  };
}

export function createDragEndHandler(onClose: () => void): (event: unknown, info: IDragInfo) => void {
  return (event: unknown, info: IDragInfo): void => {
    void event;
    if (shouldCloseFromDrag(info)) {
      onClose();
    }
  };
}

export function BottomSheet(props: IBottomSheetProps): React.JSX.Element {
  const { isOpen, onClose, title, children, testId } = props;
  const shouldAnimate = import.meta.env.PROD && !prefersReducedMotion();
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const sheet = sheetRef.current;
        if (!sheet) {
          return;
        }

        const focusableElements = sheet.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) {
          return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
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
      const firstFocusable = sheetRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement | undefined;
      firstFocusable?.focus();
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

  const handleDragEnd = createDragEndHandler(onClose);

  return (
    <motion.div
      className={overlayClassName}
      onClick={handleOverlayClick}
      data-test-id={testId}
      role="dialog"
      aria-modal
      {...overlayMotionProps(shouldAnimate)}
    >
      <motion.div
        ref={sheetRef}
        className={sheetClassName}
        onDragEnd={handleDragEnd}
        {...sheetDragProps(shouldAnimate)}
        {...sheetMotionProps(shouldAnimate)}
      >
        <div className="tw:flex tw:justify-center tw:pt-2 tw:pb-1 md:tw:hidden">
          <div className="tw:w-10 tw:h-1 tw:rounded-full tw:bg-[var(--color-border)]" />
        </div>
        {title && (
          <div className="tw:px-4 tw:py-3 tw:border-b tw:border-[var(--color-border)]">
            <h2 className="tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)]">{title}</h2>
          </div>
        )}
        <div className="tw:p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}
