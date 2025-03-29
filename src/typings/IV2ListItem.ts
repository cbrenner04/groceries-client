import type IListItemField from './IListItemField';

export default interface IV2ListItems {
  id: string;
  archived_at?: string;
  refreshed: boolean;
  completed: boolean;
  user_id: string;
  list_id: string;
  created_at: string;
  updated_at: string;
  fields: IListItemField[];
}
