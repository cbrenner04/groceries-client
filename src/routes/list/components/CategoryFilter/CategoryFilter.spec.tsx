import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

import CategoryFilter, { type ICategoryFilterProps } from './index';

function setup(suppliedProps: Partial<ICategoryFilterProps>): RenderResult {
  const defaultProps: ICategoryFilterProps = {
    handleClearFilter: jest.fn(),
    handleCategoryFilter: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };

  return render(<CategoryFilter {...props} />);
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
    const { container, findByRole } = setup({ categories: ['foo', 'bar'], filter: '' });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders NoFilter when categories do not exist', async () => {
    const { container, findByRole } = setup({ categories: [], filter: '' });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).toBeDisabled();
  });
});
