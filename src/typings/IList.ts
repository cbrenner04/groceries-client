import type EListType from './EListType';

export default interface IList {
  id?: string;
  name: string;
  type: EListType;
  created_at?: string;
  completed?: boolean;
  users_list_id?: string;
  owner_id?: string;
  refreshed?: boolean;
  categories?: string[];
}
