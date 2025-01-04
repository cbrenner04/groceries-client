import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import EditLink from './EditLink';

async function setup(): Promise<{ editLink: HTMLElement }> {
  const props = {
    to: '/fake/route',
    style: {},
    testID: 'foo',
  };
  const { findByRole } = render(
    <MemoryRouter>
      <EditLink {...props} />
    </MemoryRouter>,
  );
  const editLink = await findByRole('link');

  return { editLink };
}

describe('EditLink', () => {
  it('renders a link', async () => {
    const { editLink } = await setup();

    expect(editLink).toMatchSnapshot();
    expect(editLink).toHaveAttribute('href', '/fake/route');
  });
});
