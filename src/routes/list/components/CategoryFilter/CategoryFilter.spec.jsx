import React from 'react';
import { render } from '@testing-library/react';

import CategoryFilter from './index';

describe('CategoryFilter', () => {
  it('renders Filtered when categories and filter exist', () => {
    const props = {
      categories: ['foo', 'bar'],
      filter: 'foo',
      handleClearFilter: jest.fn(),
      handleCategoryFilter: jest.fn(),
    };
    const { container, getByRole } = render(<CategoryFilter {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('foo');
  });

  it('renders Filter when categories exist but filter does not', () => {
    const props = {
      categories: ['foo', 'bar'],
      filter: '',
      handleClearFilter: jest.fn(),
      handleCategoryFilter: jest.fn(),
    };
    const { container, getByRole } = render(<CategoryFilter {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('Filter by category');
    expect(getByRole('button')).not.toBeDisabled();
  });

  it('renders NoFilter when categories do not exist', () => {
    const props = {
      categories: [],
      filter: '',
      handleClearFilter: jest.fn(),
      handleCategoryFilter: jest.fn(),
    };
    const { container, getByRole } = render(<CategoryFilter {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('Filter by category');
    expect(getByRole('button')).toBeDisabled();
  });
});
