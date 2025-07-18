export default interface IListItemField {
  id: string;
  list_item_field_configuration_id: string;
  data: string;
  archived_at: string | null;
  user_id: string;
  list_item_id: string;
  created_at: string;
  updated_at: string | null;
  label: string;
  position: number;
  data_type: 'boolean' | 'date_time' | 'free_text' | 'number';
}
