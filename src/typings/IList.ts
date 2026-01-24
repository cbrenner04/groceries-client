export default interface IList {
  id?: string;
  name: string;
  list_item_configuration_id?: string;
  created_at?: string;
  completed?: boolean;
  users_list_id?: string;
  owner_id?: string;
  refreshed?: boolean;
  categories?: string[];
}
