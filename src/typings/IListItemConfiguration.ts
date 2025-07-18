export default interface IListItemConfiguration {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  user_id: string;
  archived_at: string | null;
}
