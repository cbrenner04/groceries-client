import { handleItemEdit } from './handleItemEdit';
import { createListItem } from '../../../../test-utils/factories';

const item = createListItem('1', false, [], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemEdit', () => {
  it('navigates to edit', () => {
    const nav = jest.fn();
    handleItemEdit({ item, listId: '1', navigate: nav });
    expect(nav).toHaveBeenCalledWith('/lists/1/list_items/1/edit');
  });
});
