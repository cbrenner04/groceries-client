import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppRouter from './AppRouter';

const { templatesMounted, listsMounted } = vi.hoisted(() => ({
  templatesMounted: vi.fn(),
  listsMounted: vi.fn(),
}));

vi.mock('./routes/lists/Lists', () => ({
  default: function Lists(): React.JSX.Element {
    useEffect(() => {
      listsMounted();
    }, []);

    return <h1 data-test-id="page-title">Lists</h1>;
  },
}));

vi.mock('./routes/templates/Templates', () => ({
  default: function Templates(): React.JSX.Element {
    useEffect(() => {
      templatesMounted();
    }, []);

    return <h1 data-test-id="page-title">Templates</h1>;
  },
}));

describe('AppRouter animated navigation', () => {
  beforeEach(() => {
    vi.stubEnv('PROD', true);
    window.history.replaceState({}, '', '/lists');
    sessionStorage.setItem(
      'user',
      JSON.stringify({ 'access-token': 'test-token', client: 'test-client', uid: 'test-user' }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('mounts the destination once after the outgoing page exits', async () => {
    const user = userEvent.setup();
    const { findByTestId, getByTestId } = render(<AppRouter />);

    await user.click(await findByTestId('nav-templates'));

    await waitFor(() => {
      expect(Number(getByTestId('page-transition').style.opacity)).toBeLessThan(1);
    });
    await waitFor(() => {
      expect(getByTestId('page-title')).toHaveTextContent('Templates');
      expect(getByTestId('page-transition')).toHaveStyle({ opacity: '1' });
    });
    expect(templatesMounted).toHaveBeenCalledTimes(1);
  });

  it('keeps the final destination visible when navigation changes during exit', async () => {
    const user = userEvent.setup();
    const { findByTestId, getByTestId } = render(<AppRouter />);

    await user.click(await findByTestId('nav-templates'));
    await waitFor(() => {
      expect(Number(getByTestId('page-transition').style.opacity)).toBeLessThan(1);
    });
    await user.click(await findByTestId('nav-lists'));

    await waitFor(() => {
      expect(getByTestId('page-title')).toHaveTextContent('Lists');
      expect(getByTestId('page-transition')).toHaveStyle({ opacity: '1' });
    });
    expect(templatesMounted).not.toHaveBeenCalled();
    expect(listsMounted).toHaveBeenCalledTimes(1);
  });
});
