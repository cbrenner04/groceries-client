import React, { useContext } from 'react';
import { useNavigate } from 'react-router';

import { PageLayout } from 'components/layout/PageLayout';
import { useTheme } from 'components/ThemeProvider';
import { Button } from 'components/ui/Button';
import { UserContext } from 'AppRouter';
import axios from 'utils/api';
import { showToast } from 'utils/toast';

type TThemeOption = 'light' | 'dark' | 'system';

const themeOptions: Array<{ value: TThemeOption; label: string; testId: string }> = [
  { value: 'light', label: 'Light', testId: 'theme-light' },
  { value: 'dark', label: 'Dark', testId: 'theme-dark' },
  { value: 'system', label: 'System', testId: 'theme-system' },
];

const Settings: React.FC = (): React.JSX.Element => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const context = useContext(UserContext);

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    context?.signOutUser();
    showToast.info('Log out successful');
    navigate('/users/sign_in');
  };

  const segmentedControlClassName =
    'tw:flex tw:rounded-[var(--radius-md)] tw:bg-[var(--color-surface-overlay)] tw:p-0.5';

  return (
    <PageLayout title="Settings">
      <div className="tw:space-y-6">
        <div>
          <p
            className={
              'tw:text-sm tw:font-semibold tw:uppercase tw:tracking-wide ' +
              'tw:text-[var(--color-text-secondary)] tw:mb-3'
            }
          >
            Theme
          </p>
          <div className={segmentedControlClassName} role="radiogroup" aria-label="Theme">
            {themeOptions.map((option) => {
              const isActive = theme === option.value;
              const optionClassName =
                'tw:flex-1 tw:text-center tw:text-sm tw:py-2 tw:px-3 tw:rounded-[var(--radius-sm)] ' +
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

        <div>
          <Button variant="danger" fullWidth data-test-id="log-out-link" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
