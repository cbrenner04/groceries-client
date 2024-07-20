import React from 'react';
import { render } from '@testing-library/react';

import CategoryFilter from './index';

function setup(suppliedProps) {
  const defaultProps = {
    categories: [],
    filter: '',
    handleClearFilter: jest.fn(),
    handleCategoryFilter: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findByRole } = render(<CategoryFilter {...props} />);

  return { container, findByRole };
}

describe('CategoryFilter', () => {
  it('renders Filtered when categories and filter exist', async () => {
    const { container, findByRole } = setup({
      categories: ['foo', 'bar'],
      filter: 'foo',
    });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('foo');
  });

  it('renders Filter when categories exist but filter does not', async () => {
    const { container, findByRole } = setup({ categories: ['foo', 'bar'] });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders NoFilter when categories do not exist', async () => {
    const { container, findByRole } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).toBeDisabled();
  });
});
