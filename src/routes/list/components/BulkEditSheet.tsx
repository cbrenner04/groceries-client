import React from 'react';
import { useNavigate } from 'react-router';
import { BottomSheet } from 'components/ui/BottomSheet';
import BulkEditListItemsForm from '../containers/BulkEditListItemsForm';
import type { IList, IListItem, IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

export interface IBulkEditSheetProps {
  listId: string;
  items: IListItem[];
  lists: IList[];
  categories: string[];
  listItemConfiguration: IListItemConfiguration;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
  onClose: () => void;
  onSave: () => void;
}

const BulkEditSheet: React.FC<IBulkEditSheetProps> = (props): React.JSX.Element => {
  const navigate = useNavigate();
  const { listId, items, lists, categories, listItemConfiguration, listItemFieldConfigurations, onClose, onSave } =
    props;
  return (
    <BottomSheet isOpen={true} onClose={onClose} title="Edit Items" testId="bulk-edit-sheet">
      <BulkEditListItemsForm
        navigate={(url: string): void => {
          if (url === `/lists/${listId}`) {
            onSave();
          } else {
            navigate(url);
          }
        }}
        items={items}
        list={{ id: listId } as IList}
        lists={lists}
        categories={categories}
        // Bulk edit in the list detail context doesn't use list-sharing user assignments.
        listUsers={[]}
        listItemConfiguration={listItemConfiguration}
        listItemFieldConfigurations={listItemFieldConfigurations}
        isBottomSheet={true}
        onCancel={onClose}
      />
    </BottomSheet>
  );
};

export default BulkEditSheet;
