import type IListItemField from './IListItemField';

export default interface IV2ListItem {
  id: string;
  archived_at: string | null;
  refreshed: boolean;
  completed: boolean;
  user_id: string;
  list_id: string;
  created_at: string;
  updated_at: string | null;
  fields: IListItemField[];
}
