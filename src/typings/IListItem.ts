export default interface IListItem {
  id: string;
  product?: string | null;
  task?: string;
  content?: string;
  quantity?: string | null;
  author?: string | null;
  title?: string;
  artist?: string | null;
  album?: string | null;
  assignee_id?: string | null;
  due_by?: Date | string | null;
  read?: boolean;
  number_in_series?: number | null;
  category?: string | null;
  completed?: boolean;
  purchased?: boolean;
  created_at?: string;
  user_id?: string;
}
