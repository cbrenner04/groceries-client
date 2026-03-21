import React, { type ReactNode, useState, useRef, useEffect } from 'react';
import { QuestionCircleIcon } from './icons';

interface ITitlePopoverProps {
  message: ReactNode;
  title: string;
}

const TitlePopover: React.FC<ITitlePopoverProps> = (props): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="row m-0">
      <h2 className="text-capitalize pe-0 w-auto">{props.title}</h2>
      <div className="tw:relative w-auto p-0">
        <button
          ref={buttonRef}
          type="button"
          className="float-end text-secondary ps-0 w-auto border-0 bg-transparent align-self-start"
          data-test-id={`${props.title}-popover`}
          style={{ cursor: 'pointer', lineHeight: 1 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <QuestionCircleIcon size="sm" />
        </button>
        {isOpen && (
          <div
            ref={popoverRef}
            className={
              'tw:absolute tw:bottom-full tw:left-1/2 tw:-translate-x-1/2 tw:mb-2 tw:z-50 ' +
              'tw:bg-[var(--color-surface-raised)] tw:border tw:border-[var(--color-border)] ' +
              'tw:rounded-lg tw:shadow-md tw:p-3 tw:min-w-[200px]'
            }
            data-test-id="popover-content"
          >
            {props.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TitlePopover;
