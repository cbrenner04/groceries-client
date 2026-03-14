export type { default as IListItemConfiguration } from './IListItemConfiguration';
export type { default as IListItemField } from './IListItemField';
export type { default as IListItemFieldConfiguration } from './IListItemFieldConfiguration';
export type { default as IList } from './IList';
export type { default as IListUser } from './IListUser';
export type { default as IUsersList } from './IUsersList';
export type { default as IListItem } from './IListItem';

// no idea why having this in its own file created type issues
export type TUserPermissions = Record<string, 'read' | 'write'>;
export enum EUserPermissions {
  WRITE = 'write',
  READ = 'read',
}
export enum EListItemFieldType {
  BOOLEAN = 'boolean',
  DATE_TIME = 'date_time',
  FREE_TEXT = 'free_text',
  NUMBER = 'number',
}
