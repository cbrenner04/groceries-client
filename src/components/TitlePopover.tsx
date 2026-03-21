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
    <div className="flex items-center m-0">
      <h2 className="text-capitalize pe-0 w-auto">{props.title}</h2>
      <div className="relative">
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
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 ' +
              'bg-[var(--color-surface-raised)] border border-[var(--color-border)] ' +
              'rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-3 min-w-[200px]'
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
