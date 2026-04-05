import React from 'react';

import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/Button';

export interface ISettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type TThemeOption = 'light' | 'dark' | 'system';

const themeOptions: Array<{ value: TThemeOption; label: string; testId: string }> = [
  { value: 'light', label: 'Light', testId: 'theme-light' },
  { value: 'dark', label: 'Dark', testId: 'theme-dark' },
  { value: 'system', label: 'System', testId: 'theme-system' },
];

export function SettingsMenu(props: ISettingsMenuProps): React.JSX.Element {
  const { isOpen, onClose } = props;
  const { theme, setTheme } = useTheme();

  if (!isOpen) {
    return <></>;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const containerClassName =
    'tw:absolute tw:bottom-full tw:mb-2 tw:left-0 tw:right-0 tw:mx-auto tw:w-56 ' +
    'tw:bg-[var(--color-surface-raised)] tw:border tw:border-[var(--color-border)] ' +
    'tw:shadow-[var(--shadow-lg)] tw:rounded-[var(--radius-lg)] tw:overflow-hidden';

  const segmentedControlClassName =
    'tw:flex tw:rounded-[var(--radius-md)] tw:bg-[var(--color-surface-overlay)] tw:p-0.5';

  return (
    <div className="tw:fixed tw:inset-0 tw:z-50" onClick={handleOverlayClick}>
      <div className="tw:fixed tw:bottom-16 tw:left-0 tw:right-0 tw:flex tw:justify-center">
        <div className={containerClassName} data-test-id="settings-menu" role="menu">
          <div className="tw:p-3">
            <p
              className={
                'tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide ' +
                'tw:text-[var(--color-text-secondary)] tw:mb-2'
              }
            >
              Theme
            </p>
            <div className={segmentedControlClassName} role="radiogroup" aria-label="Theme">
              {themeOptions.map((option) => {
                const isActive = theme === option.value;
                const optionClassName =
                  'tw:flex-1 tw:text-center tw:text-sm tw:py-1.5 tw:px-2 tw:rounded-[var(--radius-sm)] ' +
                  'tw:cursor-pointer tw:transition-colors tw:duration-150 ' +
                  (isActive
                    ? 'tw:bg-[var(--color-surface)] tw:text-[var(--color-text-primary)] tw:font-medium tw:shadow-sm'
                    : 'tw:text-[var(--color-text-secondary)] tw:hover:text-[var(--color-text-primary)]');

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={optionClassName}
                    data-test-id={option.testId}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="tw:border-t tw:border-[var(--color-border)]" />
          <div className="tw:p-3">
            <Button
              variant="ghost"
              fullWidth
              data-test-id="log-out-link"
              className="tw:!text-[var(--color-danger)] tw:justify-start"
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
