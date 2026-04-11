import React from 'react';
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
  const { listId, items, lists, categories, listItemConfiguration, listItemFieldConfigurations, onClose, onSave } =
    props;
  return (
    <BottomSheet isOpen={true} onClose={onClose} title="Edit Items" testId="bulk-edit-sheet">
      <BulkEditListItemsForm
        navigate={(url: string): void => {
          if (url === `/lists/${listId}`) {
            onSave();
          } else {
            // Handle other navigations if needed
            window.location.href = url;
          }
        }}
        items={items}
        list={{ id: listId } as IList}
        lists={lists}
        categories={categories}
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
