import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider, useTheme } from './ThemeProvider';

function TestComponentInside(): React.JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <div data-test-id="theme-value">{theme}</div>
      <div data-test-id="resolved-theme-value">{resolvedTheme}</div>
      <button data-test-id="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-test-id="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-test-id="set-system" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.clearAllMocks();
  });

  it('renders children', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(await findByText('Test Content')).toBeVisible();
  });

  it('initializes with system theme when nothing is stored', async () => {
    render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  it('sets data-theme attribute on html element', async () => {
    render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    await waitFor(() => {
      const dataTheme = document.documentElement.getAttribute('data-theme');
      expect(['light', 'dark']).toContain(dataTheme);
    });
  });

  it('persists theme choice to localStorage', async () => {
    const user = userEvent.setup();
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    const setLightButton = await findByTestId('set-light');
    await user.click(setLightButton);

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  it('restores theme from localStorage on mount', async () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('allows toggling between light and dark theme', async () => {
    const user = userEvent.setup();
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    const setLightButton = await findByTestId('set-light');
    const setDarkButton = await findByTestId('set-dark');

    await user.click(setLightButton);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    await user.click(setDarkButton);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('provides resolvedTheme as light or dark regardless of system setting', async () => {
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    const resolvedThemeElement = await findByTestId('resolved-theme-value');
    await waitFor(() => {
      expect(['light', 'dark']).toContain(resolvedThemeElement.textContent);
    });
  });

  it('throws error when useTheme is called outside ThemeProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ComponentUsingThemeOutsideProvider(): React.JSX.Element {
      const { resolvedTheme } = useTheme();
      return <div>{resolvedTheme}</div>;
    }

    expect(() => {
      render(<ComponentUsingThemeOutsideProvider />);
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleErrorSpy.mockRestore();
  });
});
