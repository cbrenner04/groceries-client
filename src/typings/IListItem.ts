export default interface IListItem {
  id?: string;
  product?: string;
  task?: string;
  content?: string;
  quantity?: string;
  author?: string;
  title?: string;
  artist?: string;
  album?: string;
  assignee_id?: string;
  due_by?: string;
  read?: boolean;
  number_in_series?: number;
  category?: string;
  completed?: boolean;
  purchased?: boolean;
  created_at?: string;
  user_id?: string;
  book_list_id?: string;
  grocery_list_id?: string;
  music_list_id?: string;
  simple_list_id?: string;
  to_do_list_id?: string;
}
