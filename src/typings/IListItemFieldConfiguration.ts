import { type EListItemFieldType } from './index';

export default interface IListItemFieldConfiguration {
  id: string;
  label: string;
  data_type: EListItemFieldType;
  position: number;
  primary: boolean;
  archived_at: string | null;
  list_item_configuration_id: string;
  created_at: string;
  updated_at: string | null;
}
