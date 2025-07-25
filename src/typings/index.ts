export { default as EListType } from './EListType';
export { default as IListItemConfiguration } from './IListItemConfiguration';
export { default as IListItemField } from './IListItemField';
export { default as IListItemFieldConfiguration } from './IListItemFieldConfiguration';
export { default as IList } from './IList';
export { default as IListUser } from './IListUser';
export { default as IUsersList } from './IUsersList';
export { default as IListItem } from './IListItem';

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
