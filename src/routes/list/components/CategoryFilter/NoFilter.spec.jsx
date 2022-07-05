import React from 'react';
import { render } from '@testing-library/react';

import NoFilter from './NoFilter';

describe('NoFilter', () => {
  it('renders a disabled button', async () => {
    const { container, findByRole } = render(<NoFilter />);

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toBeDisabled();
  });
});
