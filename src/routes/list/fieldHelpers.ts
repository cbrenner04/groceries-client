import { EListItemFieldType } from 'typings';
import type { IListItem, IListItemFieldConfiguration } from 'typings';

export interface IBulkFieldUpdate {
  id: string;
  label: string;
  data: string;
  clear: boolean;
  itemIds: string[];
}

export function isBooleanFieldConfig(config: { data_type: string }): boolean {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison */
  return config.data_type === EListItemFieldType.BOOLEAN;
}

/** Normalize boolean-like values to "true" | "false" | "". */
export function normalizeBooleanToString(value: unknown): '' | 'true' | 'false' {
  if (value === true || value === 'true') {
    return 'true';
  }
  if (value === false || value === 'false') {
    return 'false';
  }
  return '';
}

export function getInitialBulkFieldUpdates(
  configs: IListItemFieldConfiguration[],
  items: IListItem[],
): IBulkFieldUpdate[] {
  return configs.map((config) => {
    const isBoolean = isBooleanFieldConfig(config);
    const fieldValues = items.map((item) => {
      const field = item.fields.find((f) => f.label === config.label);
      const raw = field?.data ?? '';
      const data = isBoolean ? normalizeBooleanToString(raw) : (raw as string);
      return { id: field?.id ?? '', data };
    });

    const unique = [...new Set(fieldValues.map((fv) => fv.data))];
    const commonValue = unique.length === 1 ? unique[0] : '';

    return {
      id: config.id,
      label: config.label,
      data: commonValue,
      clear: false,
      itemIds: items.map((i) => i.id),
    };
  });
}

export function buildBulkUpdateFieldsPayload(
  configs: IListItemFieldConfiguration[],
  fieldUpdates: IBulkFieldUpdate[],
): { data: string; label: string; item_ids: string[] }[] {
  const result: { data: string; label: string; item_ids: string[] }[] = [];
  for (const config of configs) {
    const update = fieldUpdates.find((f) => f.label === config.label);
    if (!update) {
      continue;
    }

    if (isBooleanFieldConfig(config)) {
      const data = update.clear ? '' : (update.data === 'true' ? 'true' : 'false');
      result.push({ data, label: config.label, item_ids: update.itemIds });
    } else if (update.data || update.clear) {
      const data = update.clear ? '' : update.data;
      result.push({
        data,
        label: config.label,
        item_ids: update.itemIds,
      });
    }
  }
  return result;
}

export interface IFieldConfig {
  label: string;
  data_type: string;
}

/**
 * Parse value from a bulk-edit field change event. Returns null for clear_ checkboxes.
 */
export function parseBulkFieldChange(
  event: { target: { name: string; value: string; type: string; checked: boolean } },
  configs: IFieldConfig[],
): { label: string; data: string } | null {
  const { name, value, type, checked } = event.target;
  if (name.startsWith('clear_')) {
    return null;
  }

  const config = configs.find((c) => c.label === name);
  if (config && isBooleanFieldConfig(config) && type === 'checkbox') {
    return { label: name, data: checked ? 'true' : 'false' };
  }
  return { label: name, data: value };
}
