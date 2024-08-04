export { default as EListType } from './EListType';
export { default as IListItem } from './IListItem';
export { default as IList } from './IList';
export { default as IListUser } from './IListUser';
export { default as IUsersList } from './IUsersList';

// no idea why having this in its own file created type issues
export type TUserPermissions = Record<string, 'read' | 'write'>;
