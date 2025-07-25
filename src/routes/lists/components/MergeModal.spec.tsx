import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MergeModal from './MergeModal';
import { EListType } from 'typings';

const defaultProps = {
  showModal: true,
  clearModal: jest.fn(),
  listNames: 'name, name',
  mergeName: '',
  handleMergeConfirm: jest.fn(),
  handleMergeNameChange: jest.fn(),
  selectedLists: [
    { id: '1', name: 'Test List 1', type: EListType.GROCERY_LIST },
    { id: '2', name: 'Test List 2', type: EListType.GROCERY_LIST },
  ],
};

function setup(suppliedProps = {}): ReturnType<typeof render> & {
  props: typeof defaultProps;
  user: ReturnType<typeof userEvent.setup>;
} {
  const props = { ...defaultProps, ...suppliedProps };
  const user = userEvent.setup();
  const component = render(<MergeModal {...props} />);
  return { ...component, props, user };
}

describe('MergeModal', () => {
  it('does not render modal when showModal is false', () => {
    const { container, queryByTestId } = setup({ showModal: false });

    expect(container).toMatchInlineSnapshot('<div />');
    expect(queryByTestId('confirm-merge')).toBeNull();
  });

  it('renders', async () => {
    const { container, findByTestId, findByText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByText('Merge "name, name"')).toBeVisible();
    expect(await findByTestId('confirm-merge')).toBeDisabled();
  });

  it('calls handleMergeNameChange when input value changes', async () => {
    const { findByLabelText, props, user } = setup();

    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });

  it('clears modal when x button is selected', async () => {
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('clears modal when Close is selected', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('clear-merge'));

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('enables confirm when mergeName has a value', async () => {
    const { findByTestId } = setup({ mergeName: 'foo' });

    expect(await findByTestId('confirm-merge')).toBeEnabled();
  });

  it('call handleMergeConfirm when Merge lists is selected', async () => {
    const { findByLabelText, findByTestId, props, user } = setup();

    await user.type(await findByLabelText('Name for the merged list'), 'a');
    await user.click(await findByTestId('confirm-merge'));

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });

  it('shows warning when lists of different types are selected', async () => {
    const { findByText } = setup({
      selectedLists: [
        { id: '1', name: 'Grocery List', type: EListType.GROCERY_LIST },
        { id: '2', name: 'Book List', type: EListType.BOOK_LIST },
      ],
    });

    expect(await findByText(/Only lists of the same type can be merged/)).toBeVisible();
    expect(await findByText(/while other types will be excluded/)).toBeVisible();
  });

  it('shows detailed breakdown when lists of different types are selected', async () => {
    const { findByText } = setup({
      selectedLists: [
        { id: '1', name: 'Grocery List 1', type: EListType.GROCERY_LIST },
        { id: '2', name: 'Grocery List 2', type: EListType.GROCERY_LIST },
        { id: '3', name: 'Book List', type: EListType.BOOK_LIST },
      ],
    });

    expect(await findByText('Lists to be merged (2):')).toBeVisible();
    expect(await findByText('Lists excluded (1):')).toBeVisible();
    expect(await findByText('Grocery List 1 (GroceryList)')).toBeVisible();
    expect(await findByText('Grocery List 2 (GroceryList)')).toBeVisible();
    expect(await findByText('Book List (BookList)')).toBeVisible();
  });

  it('does not show warning when all lists are the same type', async () => {
    const { queryByText } = setup({
      selectedLists: [
        { id: '1', name: 'Grocery List 1', type: EListType.GROCERY_LIST },
        { id: '2', name: 'Grocery List 2', type: EListType.GROCERY_LIST },
      ],
    });

    expect(queryByText(/Only lists of the same type can be merged/)).toBeNull();
  });
});
