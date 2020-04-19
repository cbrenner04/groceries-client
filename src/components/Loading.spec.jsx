import React from 'react';
import { render } from '@testing-library/react';

import Loading from './Loading';

describe('Loading', () => {
  it('renders the spinner', () => {
    const { getByRole } = render(<Loading />);

    expect(getByRole('status')).toMatchSnapshot();
  });
});
