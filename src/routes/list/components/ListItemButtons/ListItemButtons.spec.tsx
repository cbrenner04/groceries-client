import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { EListType } from 'typings';

import ListItemButtons, { type IListItemButtonsProps } from './index';

async function setup(
  suppliedProps: Partial<IListItemButtonsProps>,
): Promise<{ container: HTMLElement; buttons: HTMLElement[] }> {
  const defaultProps = {
    item: {
      grocery_list_id: 'id1',
      id: 'id1',
      read: true,
    },
    purchased: true,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    toggleItemRead: jest.fn(),
    handleItemRefresh: jest.fn(),
    handleItemEdit: jest.fn(),
    listType: EListType.GROCERY_LIST,
    multiSelect: false,
    selectedItems: [],
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findAllByRole } = render(
    <MemoryRouter>
      <ListItemButtons {...props} />
    </MemoryRouter>,
  );
  const buttons = await findAllByRole('button');

  return { container, buttons };
}

describe('ListItemButtons', () => {
  it('renders Purchased when the item is purchased', async () => {
    const { container, buttons } = await setup({ purchased: true });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('renders NotPurchased when the item is not purchased', async () => {
    const { container, buttons } = await setup({ purchased: false });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-check');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });
});
