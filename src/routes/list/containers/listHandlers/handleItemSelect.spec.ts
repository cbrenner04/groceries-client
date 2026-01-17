import { handleItemSelect } from './handleItemSelect';
import { createListItem } from '../../../../test-utils/factories';

// Mock immutability-helper
jest.mock('immutability-helper', () => jest.requireActual('immutability-helper'));

const item = createListItem('1', false, [], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemSelect', () => {
  it('selects and deselects', () => {
    const setSelected = jest.fn();
    handleItemSelect({ item, selectedItems: [], setSelectedItems: setSelected });
    expect(setSelected).toHaveBeenCalled();
    handleItemSelect({ item, selectedItems: [item], setSelectedItems: setSelected });
    expect(setSelected).toHaveBeenCalled();
  });
});
