import React from 'react';
import { render } from '@testing-library/react';

import TitlePopover from './TitlePopover';

describe('TitlePopover', () => {
  it('renders', () => {
    const { container } = render(<TitlePopover title="foo" message="bar" />);

    expect(container).toMatchSnapshot();
  });
});
