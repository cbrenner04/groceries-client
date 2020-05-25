import React from 'react';
import { render } from '@testing-library/react';

import NoFilter from './NoFilter';

describe('NoFilter', () => {
  it('renders a disabled button', () => {
    const { container, getByRole } = render(<NoFilter />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toBeDisabled();
  });
});
