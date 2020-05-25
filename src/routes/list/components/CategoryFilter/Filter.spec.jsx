import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import Filter from './Filter';

describe('Filter', () => {
  const props = {
    categories: ['foo', 'bar', ''],
    handleCategoryFilter: jest.fn(),
  };

  it('renders filter dropdown', () => {
    const { getByTestId } = render(<Filter {...props} />);

    expect(getByTestId('filter-dropdown')).toMatchSnapshot();
  });

  it('renders filter options when dropdown is clicked', async () => {
    const { getByRole, getByTestId, getByText } = render(<Filter {...props} />);
    fireEvent.click(getByRole('button'));

    await waitFor(() => getByText('foo'));

    expect(getByTestId('filter-dropdown')).toMatchSnapshot();
    expect(getByText('foo')).toBeVisible();
    expect(getByText('bar')).toBeVisible();
  });

  it('calls handleCategoryFilter when filter is selected', async () => {
    const { getByRole, getByText } = render(<Filter {...props} />);
    fireEvent.click(getByRole('button'));

    await waitFor(() => getByText('foo'));

    fireEvent.click(getByText('foo'));

    expect(props.handleCategoryFilter).toHaveBeenCalled();
  });
});
