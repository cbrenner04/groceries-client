import { type EListItemFieldType } from './index';

export default interface IListItemFieldConfiguration {
  id: string;
  label: string;
  data_type: EListItemFieldType;
  position: number;
  primary: boolean;
}
