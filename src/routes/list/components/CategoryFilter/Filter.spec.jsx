import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Filter from './Filter';

function setup() {
  const user = userEvent.setup();
  const props = {
    categories: ['foo', 'bar', ''],
    handleCategoryFilter: jest.fn(),
  };

  const { findByRole, findByTestId, findByText } = render(<Filter {...props} />);

  return { findByRole, findByTestId, findByText, props, user };
}

describe('Filter', () => {
  it('renders filter dropdown', async () => {
    const { findByTestId } = setup();

    expect(await findByTestId('filter-dropdown')).toMatchSnapshot();
  });

  it('renders filter options when dropdown is clicked', async () => {
    const { findByRole, findByTestId, findByText, user } = setup();
    await user.click(await findByRole('button'));

    expect(await findByTestId('filter-dropdown')).toMatchSnapshot();
    expect(await findByText('foo')).toBeVisible();
    expect(await findByText('bar')).toBeVisible();
  });

  it('calls handleCategoryFilter when filter is selected', async () => {
    const { findByRole, findByText, props, user } = setup();
    await user.click(await findByRole('button'));

    await user.click(await findByText('foo'));

    expect(props.handleCategoryFilter).toHaveBeenCalled();
  });
});
