import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import { BottomInputBarFormProvider } from 'components/layout/BottomInputBarFormContext';
import {
  createField,
  createListItem,
  createListItemFieldConfiguration,
  createListUser,
  defaultTestData,
} from 'test-utils/factories';
import axios from 'utils/api';
import ListContainer, { type IListContainerProps } from './ListContainer';

vi.mock('hooks', async () => ({
  ...(await vi.importActual('hooks')),
  usePolling: vi.fn(),
  useSessionMode: (): { mode: 'neutral'; onItemAdded: () => void; onItemCompleted: () => void } => ({
    mode: 'neutral',
    onItemAdded: vi.fn(),
    onItemCompleted: vi.fn(),
  }),
}));

const fieldConfiguration = createListItemFieldConfiguration('product-config', 'Product', { primary: true });
const item = createListItem('item-1', false, [
  createField('product-field', 'Product', 'Milk', 'item-1', {
    list_item_field_configuration_id: fieldConfiguration.id,
    primary: true,
  }),
]);

const baseProps: IListContainerProps = {
  userId: defaultTestData.userId,
  list: defaultTestData.list,
  categories: [],
  completedItems: [],
  listUsers: defaultTestData.listUsers,
  notCompletedItems: [item],
  permissions: defaultTestData.permissions,
  listsToUpdate: defaultTestData.listsToUpdate,
  listItemConfiguration: defaultTestData.listItemConfiguration,
  listItemFieldConfigurations: [fieldConfiguration],
};

function SheetHarness(props: IListContainerProps): React.JSX.Element {
  return (
    <MemoryRouter>
      <BottomInputBarFormProvider>
        <ListContainer {...props} />
      </BottomInputBarFormProvider>
    </MemoryRouter>
  );
}

describe('ListContainer open sheet state', () => {
  it('preserves an edit draft when the parent updates the same list', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        list: baseProps.list,
        item,
        list_users: baseProps.listUsers,
        list_item_configuration: baseProps.listItemConfiguration,
        list_item_field_configurations: [fieldConfiguration],
        categories: [],
      },
    });
    const user = userEvent.setup();
    const props = { ...baseProps, initialEditingItemId: item.id };
    const { findByTestId, rerender } = render(<SheetHarness {...props} />);
    const sheet = await findByTestId('edit-item-sheet');
    const input = within(sheet).getByLabelText('Product');

    await user.clear(input);
    await user.type(input, 'Oat milk');
    rerender(<SheetHarness {...props} list={{ ...props.list, name: 'Updated list name' }} />);

    const updatedSheet = await findByTestId('edit-item-sheet');
    expect(within(updatedSheet).getByLabelText('Product')).toHaveValue('Oat milk');
    expect(within(updatedSheet).getByLabelText('Product')).toBe(input);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('preserves the sharing selection and email draft when the parent updates', async () => {
    const invitedUser = createListUser('user-2', 'friend@example.com');
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        list: baseProps.list,
        invitable_users: [invitedUser],
        user_is_owner: true,
        pending: [],
        accepted: [{ user: baseProps.listUsers[0], users_list: { id: 'owner-share', permissions: 'write' } }],
        refused: [],
        current_user_id: baseProps.userId,
      },
    });
    vi.mocked(axios.post).mockResolvedValue({
      data: { id: 'new-share', user_id: invitedUser.id, permissions: 'write' },
    });
    const user = userEvent.setup();
    const { findByTestId, getByTestId, queryByTestId, rerender } = render(<SheetHarness {...baseProps} />);

    await user.click(await findByTestId('open-share-sheet'));
    const invitation = await findByTestId('invite-user-user-2');
    await user.click(within(invitation).getByRole('button', { name: invitedUser.email }));
    await findByTestId('pending-user-user-2');
    const email = within(getByTestId('share-list-sheet')).getByRole('textbox');
    await user.type(email, 'another@example.com');

    rerender(<SheetHarness {...baseProps} list={{ ...baseProps.list, name: 'Updated list name' }} />);

    await waitFor(() => {
      expect(within(getByTestId('share-list-sheet')).queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(queryByTestId('invite-user-user-2')).not.toBeInTheDocument();
    expect(getByTestId('pending-user-user-2')).toBeVisible();
    expect(within(getByTestId('share-list-sheet')).getByRole('textbox')).toHaveValue('another@example.com');
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
