import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import MultiSelectMenu, { type IMultiSelectMenuProps } from './MultiSelectMenu';

interface ISetupReturn extends RenderResult {
  props: IMultiSelectMenuProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IMultiSelectMenuProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultItem = {
    id: 'id1',
    product: 'foo',
    task: 'foo',
    quantity: 'foo',
    author: 'foo',
    title: 'foo',
    artist: 'foo',
    album: 'foo',
    assignee_id: 'id1',
    due_by: new Date('05/21/2020').toISOString(),
    read: false,
    number_in_series: 1,
    category: 'foo',
  };
  const defaultProps: IMultiSelectMenuProps = {
    isMultiSelect: true,
    setCopy: jest.fn(),
    setMove: jest.fn(),
    selectedItems: [defaultItem],
    setSelectedItems: jest.fn(),
    setMultiSelect: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <MultiSelectMenu {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('MultiSelectMenu', () => {
  it('renders when isMultiSelect', async () => {
    const { container, findByText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByText('Copy to list')).toBeVisible();
    expect(await findByText('Move to list')).toBeVisible();
  });

  it('renders when not isMultiSelect', () => {
    const { container, queryByText } = setup({ isMultiSelect: false });

    expect(container).toMatchSnapshot();
    expect(queryByText('Copy to list')).toBeNull();
    expect(queryByText('Move to list')).toBeNull();
  });

  it('calls setCopy when clicked', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Copy to list'));
    expect(props.setCopy).toHaveBeenCalledWith(true);
  });

  it('calls setMove when clicked', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Move to list'));
    expect(props.setMove).toHaveBeenCalledWith(true);
  });

  it('turns off multiSelect when Hide Select is clicked with selected items', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Hide Select'));
    expect(props.setSelectedItems).toHaveBeenCalledWith([]);
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
  });

  it('turns off multiSelect when Hide Select is clicked without selected items', async () => {
    const { findByText, props, user } = setup({ selectedItems: [] });

    await user.click(await findByText('Hide Select'));
    expect(props.setSelectedItems).not.toHaveBeenCalled();
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
  });
});
