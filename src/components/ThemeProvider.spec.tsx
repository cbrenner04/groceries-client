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

  it('responds to system theme media query change events', async () => {
    let changeListener: ((e: MediaQueryListEvent) => void) | null = null;
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeListener = handler;
        }
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQuery as unknown as MediaQueryList);

    render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    // Cast via unknown since TS cannot track closure assignment on let variables
    const fireChange = changeListener as unknown as (e: MediaQueryListEvent) => void;

    // Fire dark mode change
    fireChange({ matches: true } as MediaQueryListEvent);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Fire light mode change
    fireChange({ matches: false } as MediaQueryListEvent);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  it('sets resolved theme based on system preference when setTheme("system") is called', async () => {
    const mockMediaQuery = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQuery as unknown as MediaQueryList);

    const user = userEvent.setup();
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    // First set to light to move away from system
    await user.click(await findByTestId('set-light'));
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    // Now set back to system — matchMedia.matches = true → dark
    await user.click(await findByTestId('set-system'));
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('system');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('adds and removes theme-transitioning class during theme changes', async () => {
    const user = userEvent.setup();
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    const setDarkButton = await findByTestId('set-dark');

    await user.click(setDarkButton);

    await waitFor(
      () => {
        expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
      },
      { timeout: 100 },
    );

    await waitFor(
      () => {
        expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
      },
      { timeout: 500 },
    );
  });

  it('sets light theme when setTheme("system") is called with light system preference', async () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQuery as unknown as MediaQueryList);

    const user = userEvent.setup();
    const { findByTestId } = render(
      <ThemeProvider>
        <TestComponentInside />
      </ThemeProvider>,
    );

    // First set to dark to move away from system
    await user.click(await findByTestId('set-dark'));
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Now set back to system — matchMedia.matches = false → light
    await user.click(await findByTestId('set-system'));
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('system');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
