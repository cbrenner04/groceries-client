import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import type { IV2ListItem, IListItemField } from 'typings';
import MultiSelectMenu, { type IMultiSelectMenuProps } from './MultiSelectMenu';

interface ISetupReturn extends RenderResult {
  props: IMultiSelectMenuProps;
  user: UserEvent;
}

const mockFields: IListItemField[] = [
  {
    id: 'field-1',
    label: 'name',
    data: 'Apples',
    list_item_field_configuration_id: 'config-1',
    user_id: 'user-1',
    list_item_id: 'item-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    archived_at: '',
  },
  {
    id: 'field-2',
    label: 'quantity',
    data: '3',
    list_item_field_configuration_id: 'config-2',
    user_id: 'user-1',
    list_item_id: 'item-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    archived_at: '',
  },
];

const mockV2Item: IV2ListItem = {
  id: 'item-1',
  user_id: 'user-1',
  list_id: 'list-1',
  completed: false,
  refreshed: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  archived_at: undefined,
  fields: mockFields,
};

function setup(suppliedProps?: Partial<IMultiSelectMenuProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IMultiSelectMenuProps = {
    isMultiSelect: true,
    setCopy: jest.fn(),
    setMove: jest.fn(),
    selectedItems: [mockV2Item],
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isMultiSelect is true', async () => {
    const { container, findByText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByText('Copy to list')).toBeVisible();
    expect(await findByText('Move to list')).toBeVisible();
    expect(await findByText('Hide Select')).toBeVisible();
  });

  it('renders when isMultiSelect is false', () => {
    const { container, queryByText, getByText } = setup({ isMultiSelect: false });

    expect(container).toMatchSnapshot();
    expect(queryByText('Copy to list')).toBeNull();
    expect(queryByText('Move to list')).toBeNull();
    expect(getByText('Select')).toBeVisible();
  });

  it('calls setCopy when Copy to list is clicked', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Copy to list'));
    expect(props.setCopy).toHaveBeenCalledWith(true);
  });

  it('calls setMove when Move to list is clicked', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Move to list'));
    expect(props.setMove).toHaveBeenCalledWith(true);
  });

  it('turns off multiSelect and clears selected items when Hide Select is clicked with selected items', async () => {
    const { findByText, props, user } = setup();

    await user.click(await findByText('Hide Select'));
    expect(props.setSelectedItems).toHaveBeenCalledWith([]);
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
  });

  it('turns off multiSelect w/o clearing selected items when Hide Select is clicked w/o selected items', async () => {
    const { findByText, props, user } = setup({ selectedItems: [] });

    await user.click(await findByText('Hide Select'));
    expect(props.setSelectedItems).not.toHaveBeenCalled();
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
  });

  it('turns on multiSelect when Select is clicked', async () => {
    const { getByText, props, user } = setup({ isMultiSelect: false });

    await user.click(getByText('Select'));
    expect(props.setMultiSelect).toHaveBeenCalledWith(true);
  });

  it('handles multiple selected items correctly', async () => {
    const multipleItems: IV2ListItem[] = [
      mockV2Item,
      {
        ...mockV2Item,
        id: 'item-2',
        fields: [
          {
            ...mockFields[0],
            id: 'field-3',
            list_item_id: 'item-2',
            data: 'Bananas',
          },
        ],
      },
    ];

    const { findByText, props, user } = setup({ selectedItems: multipleItems });

    await user.click(await findByText('Hide Select'));
    expect(props.setSelectedItems).toHaveBeenCalledWith([]);
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
  });

  it('renders with empty selected items array', () => {
    const { container, queryByText, getByText } = setup({ selectedItems: [] });

    expect(container).toMatchSnapshot();
    expect(queryByText('Copy to list')).toBeVisible();
    expect(queryByText('Move to list')).toBeVisible();
    expect(getByText('Hide Select')).toBeVisible();
  });

  it('maintains proper button group structure', async () => {
    const { container } = setup();

    const buttonGroup = container.querySelector('[aria-label="copy or move items"]');
    expect(buttonGroup).toBeInTheDocument();
    expect(buttonGroup?.tagName).toBe('DIV');
    expect(buttonGroup?.className).toContain('btn-group');
  });

  it('has proper button styling classes', async () => {
    const { findByText } = setup();

    const copyButton = await findByText('Copy to list');
    const moveButton = await findByText('Move to list');
    const selectButton = await findByText('Hide Select');

    expect(copyButton.className).toContain('btn');
    expect(copyButton.className).toContain('btn-link');
    expect(moveButton.className).toContain('btn');
    expect(moveButton.className).toContain('btn-link');
    expect(selectButton.className).toContain('btn');
    expect(selectButton.className).toContain('btn-link');
    expect(selectButton.className).toContain('mx-auto');
    expect(selectButton.className).toContain('float-end');
  });

  it('has proper container structure', () => {
    const { container } = setup();

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toBe('clearfix');
  });

  it('handles rapid button clicks correctly', async () => {
    const { findByText, props, user } = setup();

    const copyButton = await findByText('Copy to list');
    const moveButton = await findByText('Move to list');

    await user.click(copyButton);
    await user.click(moveButton);

    expect(props.setCopy).toHaveBeenCalledTimes(1);
    expect(props.setMove).toHaveBeenCalledTimes(1);
    expect(props.setCopy).toHaveBeenCalledWith(true);
    expect(props.setMove).toHaveBeenCalledWith(true);
  });

  it('handles select button click when not in multi-select mode', async () => {
    const { getByText, props, user } = setup({ isMultiSelect: false });

    await user.click(getByText('Select'));
    expect(props.setMultiSelect).toHaveBeenCalledWith(true);
    expect(props.setSelectedItems).not.toHaveBeenCalled();
  });
});
