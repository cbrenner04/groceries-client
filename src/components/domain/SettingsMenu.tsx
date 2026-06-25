import React from 'react';

import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';
import {
  containerStyles,
  logoutRowStyles,
  segmentedControlStyles,
  themeLabelStyles,
  optionVariants,
} from './SettingsMenu.variants';

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

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Settings" testId="settings-menu">
      <div className={containerStyles}>
        <div className={logoutRowStyles}>
          <Button variant="ghost-danger" size="sm" data-test-id="log-out-link">
            Log out
          </Button>
        </div>
        <div>
          <p className={themeLabelStyles}>Theme</p>
          <div className={segmentedControlStyles} role="radiogroup" aria-label="Theme">
            {themeOptions.map((option) => {
              const isActive = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={optionVariants({ active: isActive })}
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
      </div>
    </BottomSheet>
  );
}
