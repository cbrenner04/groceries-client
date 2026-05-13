import { render } from '@testing-library/react';
import { PageTransition } from './PageTransition';

describe('PageTransition', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders with default fade direction', () => {
    const { container } = render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>,
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders with forward direction', () => {
    const { container } = render(
      <PageTransition direction="forward">
        <div>Test Content</div>
      </PageTransition>,
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders with back direction', () => {
    const { container } = render(
      <PageTransition direction="back">
        <div>Test Content</div>
      </PageTransition>,
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('respects prefers-reduced-motion', () => {
    matchMediaMock = vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;

    const { container } = render(
      <PageTransition direction="forward">
        <div>Test Content</div>
      </PageTransition>,
    );

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(container.firstChild).toBeTruthy();
  });
});
