import React from 'react';

import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';

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

  const segmentedControlClassName =
    'tw:flex tw:rounded-[var(--radius-md)] tw:bg-[var(--color-surface-overlay)] tw:p-0.5';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Settings" testId="settings-menu">
      <div className="tw:space-y-4">
        <div>
          <p
            className={
              'tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide ' +
              'tw:text-[var(--color-text-secondary)] tw:mb-3'
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
                'tw:focus-visible:outline-none tw:focus-visible:ring-2 ' +
                'tw:focus-visible:ring-[var(--color-primary)] ' +
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
        <Button variant="ghost-danger" fullWidth data-test-id="log-out-link" className="tw:justify-start">
          Log out
        </Button>
      </div>
    </BottomSheet>
  );
}
