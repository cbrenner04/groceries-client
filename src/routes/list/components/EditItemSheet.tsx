import React, { useState, useEffect } from 'react';
import { type AxiosError } from 'axios';
import axios from 'utils/api';
import { showToast } from 'utils/toast';
import { BottomSheet } from 'components/ui/BottomSheet';
import Loading from 'components/Loading';
import EditListItemForm from '../containers/EditListItemForm';
import type { IList, IListItem, IListUser, IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

export interface IEditItemSheetProps {
  listId: string;
  itemId: string;
  onClose: () => void;
  onSave: () => void;
}

const EditItemSheet: React.FC<IEditItemSheetProps> = (props): React.JSX.Element => {
  const { listId, itemId, onClose, onSave } = props;
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState<{
    list: IList;
    item: IListItem;
    list_users: IListUser[];
    list_item_configuration: IListItemConfiguration;
    list_item_field_configurations: IListItemFieldConfiguration[];
    categories: string[];
  } | null>(null);

  useEffect(() => {
    const fetchItemData = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/lists/${listId}/list_items/${itemId}/edit`);
        setItemData(data);
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 401) {
          showToast.error('You must sign in');
        } else if ([403, 404].includes(error.response?.status ?? 0)) {
          showToast.error('Item not found');
        } else {
          showToast.error('Failed to load item');
        }
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [listId, itemId, onClose]);

  if (loading) {
    return (
      <BottomSheet isOpen={true} onClose={onClose} title="Edit Item">
        <Loading />
      </BottomSheet>
    );
  }

  if (!itemData) {
    return <></>;
  }

  return (
    <BottomSheet isOpen={true} onClose={onClose} title="Edit Item" testId="edit-item-sheet">
      <EditListItemForm
        list={itemData.list}
        item={itemData.item}
        listUsers={itemData.list_users}
        listItemConfiguration={itemData.list_item_configuration}
        listItemFieldConfigurations={itemData.list_item_field_configurations}
        categories={itemData.categories}
        onSubmit={onSave}
        onCancel={onClose}
        isBottomSheet={true}
      />
    </BottomSheet>
  );
};

export default EditItemSheet;
