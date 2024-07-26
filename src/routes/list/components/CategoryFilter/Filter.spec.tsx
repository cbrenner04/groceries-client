import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Filter, { type IFilterProps } from './Filter';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IFilterProps;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    categories: ['foo', 'bar', ''],
    handleCategoryFilter: jest.fn(),
  };

  const component = render(<Filter {...props} />);

  return { ...component, props, user };
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
