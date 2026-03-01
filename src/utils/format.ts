import { DateTime } from 'luxon';
import { EListItemFieldType } from 'typings';

const formatDate = (date: Date | string): string => {
  const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toFormat('MMMM dd yyyy');
};

const formatDateForInput = (date?: Date | string | number): string | undefined => {
  if (!date) {
    return undefined;
  }
  const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(new Date(date));
  return dt.toFormat('yyyy-MM-dd');
};

const prettyDueBy = (date: Date | string): string => {
  const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toLocaleString(DateTime.DATE_FULL);
};
const capitalize = (category: string): string => {
  // Replace underscores with spaces, then capitalize the first letter
  const withSpaces = category.replace(/_/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};
const normalizeCategoryKey = (category: string): string => category.trimEnd().toLowerCase();
const prettyListType = (listType: string): string => listType.replace(/([A-Z])/g, ($1) => ` ${$1.toUpperCase()}`);

const fieldTypeLabelMap: Record<EListItemFieldType, string> = {
  [EListItemFieldType.FREE_TEXT]: 'Free Text',
  [EListItemFieldType.BOOLEAN]: 'True/False',
  [EListItemFieldType.DATE_TIME]: 'Date',
  [EListItemFieldType.NUMBER]: 'Number',
};

const fieldTypeLabel = (type: EListItemFieldType): string => fieldTypeLabelMap[type];

export {
  formatDate,
  formatDateForInput,
  prettyDueBy,
  capitalize,
  normalizeCategoryKey,
  prettyListType,
  fieldTypeLabel,
};
