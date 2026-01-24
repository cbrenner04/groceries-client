import { EListItemFieldType } from 'typings';
import type { IListItem, IListItemFieldConfiguration } from 'typings';

import {
  buildBulkUpdateFieldsPayload,
  getInitialBulkFieldUpdates,
  isBooleanFieldConfig,
  normalizeBooleanToString,
  parseBulkFieldChange,
} from './fieldHelpers';

describe('fieldHelpers', () => {
  describe('isBooleanFieldConfig', () => {
    it('returns true for boolean data_type', () => {
      expect(isBooleanFieldConfig({ data_type: EListItemFieldType.BOOLEAN })).toBe(true);
      expect(isBooleanFieldConfig({ data_type: 'boolean' })).toBe(true);
    });

    it('returns false for other data_types', () => {
      expect(isBooleanFieldConfig({ data_type: 'free_text' })).toBe(false);
      expect(isBooleanFieldConfig({ data_type: 'number' })).toBe(false);
    });
  });

  describe('normalizeBooleanToString', () => {
    it('returns "true" for true-like values', () => {
      expect(normalizeBooleanToString(true)).toBe('true');
      expect(normalizeBooleanToString('true')).toBe('true');
    });

    it('returns "false" for false-like values', () => {
      expect(normalizeBooleanToString(false)).toBe('false');
      expect(normalizeBooleanToString('false')).toBe('false');
    });

    it('returns "" for unknown values', () => {
      expect(normalizeBooleanToString('')).toBe('');
      expect(normalizeBooleanToString(null)).toBe('');
      expect(normalizeBooleanToString(undefined)).toBe('');
      expect(normalizeBooleanToString('other')).toBe('');
    });
  });

  describe('getInitialBulkFieldUpdates', () => {
    const configs: IListItemFieldConfiguration[] = [
      { id: 'c1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      { id: 'c2', label: 'read', data_type: EListItemFieldType.BOOLEAN, position: 2 },
    ];
    const items: IListItem[] = [
      {
        id: 'i1',
        list_id: 'l1',
        user_id: 'u1',
        created_at: '',
        updated_at: null,
        archived_at: null,
        refreshed: false,
        completed: false,
        fields: [
          {
            id: 'f1',
            label: 'product',
            data: 'Apples',
            list_item_field_configuration_id: 'c1',
            data_type: 'free_text',
            position: 1,
          } as never,
          {
            id: 'f2',
            label: 'read',
            data: true,
            list_item_field_configuration_id: 'c2',
            data_type: 'boolean',
            position: 2,
          } as never,
        ],
      },
      {
        id: 'i2',
        list_id: 'l1',
        user_id: 'u1',
        created_at: '',
        updated_at: null,
        archived_at: null,
        refreshed: false,
        completed: false,
        fields: [
          {
            id: 'f3',
            label: 'product',
            data: 'Apples',
            list_item_field_configuration_id: 'c1',
            data_type: 'free_text',
            position: 1,
          } as never,
          {
            id: 'f4',
            label: 'read',
            data: 'true',
            list_item_field_configuration_id: 'c2',
            data_type: 'boolean',
            position: 2,
          } as never,
        ],
      },
    ];

    it('builds updates with common values and normalizes boolean', () => {
      const result = getInitialBulkFieldUpdates(configs, items);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ label: 'product', data: 'Apples', clear: false });
      expect(result[1]).toMatchObject({ label: 'read', data: 'true', clear: false });
      expect(result[0].itemIds).toEqual(['i1', 'i2']);
    });

    it('uses empty common value when items differ', () => {
      const mixed = [
        { ...items[0], fields: [...items[0].fields] },
        { ...items[1], fields: items[1].fields.map((f) => (f.label === 'product' ? { ...f, data: 'Bananas' } : f)) },
      ];
      const result = getInitialBulkFieldUpdates(configs, mixed as IListItem[]);
      expect(result[0].data).toBe('');
      expect(result[1].data).toBe('true');
    });
  });

  describe('buildBulkUpdateFieldsPayload', () => {
    const configs: IListItemFieldConfiguration[] = [
      { id: 'c1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      { id: 'c2', label: 'read', data_type: EListItemFieldType.BOOLEAN, position: 2 },
    ];

    it('always includes boolean fields, defaulting to "false" when not clear', () => {
      const updates = [
        { id: 'c1', label: 'product', data: '', clear: false, itemIds: ['i1'] },
        { id: 'c2', label: 'read', data: '', clear: false, itemIds: ['i1'] },
      ];
      const result = buildBulkUpdateFieldsPayload(configs, updates);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ data: 'false', label: 'read', item_ids: ['i1'] });
    });

    it('includes non-boolean only when data or clear', () => {
      const updates = [
        { id: 'c1', label: 'product', data: 'Apples', clear: false, itemIds: ['i1'] },
        { id: 'c2', label: 'read', data: 'true', clear: false, itemIds: ['i1'] },
      ];
      const result = buildBulkUpdateFieldsPayload(configs, updates);
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.label === 'product')).toEqual({
        data: 'Apples',
        label: 'product',
        item_ids: ['i1'],
      });
      expect(result.find((r) => r.label === 'read')).toEqual({
        data: 'true',
        label: 'read',
        item_ids: ['i1'],
      });
    });

    it('sends empty data for cleared fields', () => {
      const updates = [
        { id: 'c1', label: 'product', data: '', clear: true, itemIds: ['i1'] },
        { id: 'c2', label: 'read', data: 'true', clear: true, itemIds: ['i1'] },
      ];
      const result = buildBulkUpdateFieldsPayload(configs, updates);
      expect(result[0].data).toBe('');
      expect(result[1].data).toBe('');
    });

    it('skips configs with no matching field update', () => {
      const updates = [{ id: 'c1', label: 'product', data: 'Apples', clear: false, itemIds: ['i1'] }];
      const result = buildBulkUpdateFieldsPayload(configs, updates);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('product');
    });
  });

  describe('parseBulkFieldChange', () => {
    const configs = [
      { label: 'product', data_type: 'free_text' },
      { label: 'read', data_type: EListItemFieldType.BOOLEAN },
    ];

    it('returns null for clear_ checkboxes', () => {
      expect(
        parseBulkFieldChange(
          { target: { name: 'clear_read', value: 'on', type: 'checkbox', checked: true } },
          configs,
        ),
      ).toBeNull();
    });

    it('uses checked for boolean checkboxes', () => {
      expect(
        parseBulkFieldChange(
          { target: { name: 'read', value: 'on', type: 'checkbox', checked: true } },
          configs,
        ),
      ).toEqual({ label: 'read', data: 'true' });
      expect(
        parseBulkFieldChange(
          { target: { name: 'read', value: 'on', type: 'checkbox', checked: false } },
          configs,
        ),
      ).toEqual({ label: 'read', data: 'false' });
    });

    it('uses value for non-checkbox fields', () => {
      expect(
        parseBulkFieldChange(
          { target: { name: 'product', value: 'Bananas', type: 'text', checked: false } },
          configs,
        ),
      ).toEqual({ label: 'product', data: 'Bananas' });
    });

    it('uses value when field name not in configs', () => {
      expect(
        parseBulkFieldChange(
          { target: { name: 'unknown', value: 'x', type: 'text', checked: false } },
          configs,
        ),
      ).toEqual({ label: 'unknown', data: 'x' });
    });
  });
});
