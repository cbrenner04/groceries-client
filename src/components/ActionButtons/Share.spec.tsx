import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Share from './Share';

async function setup(): Promise<{ shareButton: HTMLElement }> {
  const props = {
    to: '/fake/route',
    testID: 'foo',
    disabled: false,
    style: {},
  };
  const { findByRole } = render(
    <MemoryRouter>
      <Share {...props} />
    </MemoryRouter>,
  );
  const shareButton = await findByRole('link');

  return { shareButton };
}

describe('Share', () => {
  it('renders a link', async () => {
    const { shareButton } = await setup();

    expect(shareButton).toMatchSnapshot();
    expect(shareButton).toHaveAttribute('href', '/fake/route');
  });
});
