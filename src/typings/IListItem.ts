interface IBookListItem {
  id?: string;
  user_id?: string;
  author?: string;
  title?: string;
  read?: boolean;
  number_in_series?: number;
  purchased?: boolean;
  book_list_id?: string;
  category?: string;
  created_at?: string;
}

interface IGroceryListItem {
  id?: string;
  user_id?: string;
  product?: string;
  quantity?: string;
  purchased?: boolean;
  grocery_list_id?: string;
  category?: string;
}

interface IMusicListItem {
  id?: string;
  user_id?: string;
  title?: string;
  artist?: string;
  album?: string;
  purchased?: boolean;
  music_list_id?: string;
  category?: string;
  created_at?: string;
}

interface ISimpleListItem {
  id?: string;
  user_id?: string;
  content?: string;
  completed?: boolean;
  simple_list_id?: string;
  category?: string;
  created_at?: string;
}

interface IToDoListItem {
  id?: string;
  user_id?: string;
  task?: string;
  due_by?: string;
  assignee_id?: string;
  completed?: boolean;
  to_do_list_id?: string;
  category?: string;
  created_at?: string;
}

type IListItem = IBookListItem | IGroceryListItem | IMusicListItem | ISimpleListItem | IToDoListItem;

export default IListItem;
