import { createListItem } from 'test-utils/factories';
import { sortItemsByCreatedAt } from './sortItemsByCreatedAt';

describe('sortItemsByCreatedAt', () => {
  it('returns empty array for empty input', () => {
    expect(sortItemsByCreatedAt([])).toEqual([]);
  });

  it('returns a copy of single-item array', () => {
    const item = createListItem('1', false, []);
    const result = sortItemsByCreatedAt([item]);
    expect(result).toEqual([item]);
    expect(result).not.toBe([item]); // should be a new array
  });

  it('sorts items by created_at in ascending order', () => {
    const older = { ...createListItem('1', false, []), created_at: '2023-01-01T00:00:00Z' };
    const newer = { ...createListItem('2', false, []), created_at: '2023-06-01T00:00:00Z' };
    const newest = { ...createListItem('3', false, []), created_at: '2023-12-01T00:00:00Z' };

    const result = sortItemsByCreatedAt([newest, older, newer]);

    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('does not mutate the original array', () => {
    const items = [
      { ...createListItem('1', false, []), created_at: '2023-12-01T00:00:00Z' },
      { ...createListItem('2', false, []), created_at: '2023-01-01T00:00:00Z' },
    ];
    const original = [...items];

    sortItemsByCreatedAt(items);

    expect(items[0].id).toBe(original[0].id);
    expect(items[1].id).toBe(original[1].id);
  });

  it('handles items with the same created_at', () => {
    const item1 = { ...createListItem('1', false, []), created_at: '2023-01-01T00:00:00Z' };
    const item2 = { ...createListItem('2', false, []), created_at: '2023-01-01T00:00:00Z' };

    const result = sortItemsByCreatedAt([item1, item2]);

    expect(result).toHaveLength(2);
  });
});
