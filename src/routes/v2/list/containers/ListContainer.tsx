import React, { useState, type ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import {
  EUserPermissions,
  type IList,
  type IListItemConfiguration,
  type IListItemField,
  type IListUser,
  type IV2ListItem,
} from 'typings';
import { capitalize } from 'utils/format';

import ListItem from '../components/ListItem';
import ListItemForm from '../components/ListItemForm';
import {
  handleAddItem as exportedHandleAddItem,
  handleItemSelect as exportedHandleItemSelect,
  handleItemEdit as exportedHandleItemEdit,
  handleItemComplete as exportedHandleItemComplete,
  handleItemDelete as exportedHandleItemDelete,
  handleItemRefresh as exportedHandleItemRefresh,
} from './listHandlers';

interface IListContainerProps {
  userId: string;
  list: IList;
  categories: string[];
  completedItems: IV2ListItem[];
  listUsers: IListUser[];
  notCompletedItems: IV2ListItem[];
  permissions: EUserPermissions;
  listsToUpdate: IList[];
  listItemConfiguration: IListItemConfiguration;
  listItemConfigurations: IListItemConfiguration[];
}

const ListContainer: React.FC<IListContainerProps> = (props): React.JSX.Element => {
  const [pending, setPending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IV2ListItem[]);
  const [notCompletedItems, setNotCompletedItems] = useState(props.notCompletedItems);
  const [completedItems, setCompletedItems] = useState(props.completedItems);
  const [categories, setCategories] = useState(props.categories);
  const navigate = useNavigate();

  const handleFailure = (error: AxiosError, defaultMessage: string): void => {
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(error.response.status)) {
        toast(defaultMessage, { type: 'error' });
      } else {
        /* istanbul ignore next */
        toast('Something went wrong. Please try again.', { type: 'error' });
      }
    } else if (error.request) {
      /* istanbul ignore next */
      toast('Network error. Please check your connection.', { type: 'error' });
    } else {
      /* istanbul ignore next */
      toast(error.message, { type: 'error' });
    }
  };

  /* istanbul ignore next */
  const handleAddItem = (newItems: IV2ListItem[]): void => {
    /* istanbul ignore next */
    exportedHandleAddItem({
      newItems,
      pending,
      setPending,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      categories,
      setCategories,
    });
  };

  /* istanbul ignore next */
  const handleItemSelect = (item: IV2ListItem): void => {
    /* istanbul ignore next */
    exportedHandleItemSelect({
      item,
      selectedItems,
      setSelectedItems,
    });
  };

  const handleItemEdit = (item: IV2ListItem): void => {
    exportedHandleItemEdit({
      item,
      listId: props.list.id!,
      navigate,
    });
  };

  const handleItemComplete = async (item: IV2ListItem): Promise<void> => {
    await exportedHandleItemComplete({
      item,
      listId: props.list.id!,
      notCompletedItems,
      setNotCompletedItems,
      completedItems,
      setCompletedItems,
      setPending,
      handleFailure,
    });
  };

  const handleItemDelete = async (item: IV2ListItem): Promise<void> => {
    await exportedHandleItemDelete({
      item,
      listId: props.list.id!,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      selectedItems,
      setSelectedItems,
      setPending,
      handleFailure,
    });
  };

  const handleItemRefresh = async (item: IV2ListItem): Promise<void> => {
    await exportedHandleItemRefresh({
      item,
      listId: props.list.id!,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      setPending,
      handleFailure,
    });
  };

  const groupByCategory = (items: IV2ListItem[]): ReactNode =>
    // NOTE: adding `undefined` to handle uncategorized items
    [undefined, ...categories].map((category: string | undefined) => {
      const itemsToRender = items.filter((item: IV2ListItem) => {
        // Defensive: treat missing fields as empty array
        const fields = Array.isArray(item.fields) ? item.fields : [];
        return category
          ? fields.find((field: IListItemField) => field.label === 'category' && field.data === category)
          : !fields.find((field: IListItemField) => field.label === 'category');
      });
      if (itemsToRender.length === 0) {
        return null;
      }
      return (
        <React.Fragment key={`${category ?? 'uncategorized'}-wrapper`}>
          {category && <h5 data-test-class="category-header">{capitalize(category)}</h5>}
          <ListGroup className="mb-3" key={category ?? 'uncategorized'}>
            {itemsToRender.map((item: IV2ListItem) => (
              <ListItem
                key={item.id}
                item={item}
                permissions={props.permissions}
                selectedItems={selectedItems}
                pending={pending}
                handleItemSelect={handleItemSelect}
                handleItemComplete={handleItemComplete}
                handleItemEdit={handleItemEdit}
                handleItemDelete={handleItemDelete}
                handleItemRefresh={handleItemRefresh}
              />
            ))}
          </ListGroup>
        </React.Fragment>
      );
    });

  return (
    <React.Fragment>
      <Link to="/lists" className="float-end">
        Back to lists
      </Link>
      <h1>{props.list.name}</h1>
      <br />
      {props.permissions === EUserPermissions.WRITE ? (
        <ListItemForm
          listId={props.list.id!}
          listUsers={props.listUsers}
          userId={props.userId}
          handleItemAddition={handleAddItem}
          categories={props.categories}
          navigate={navigate}
          listItemConfiguration={props.listItemConfiguration}
        />
      ) : (
        <p>You only have permission to read this list</p>
      )}
      <hr />
      <div className="d-flex justify-content-between">
        <h2>Items</h2>
        {/* <div>
          <CategoryFilter
            categories={includedCategories}
            filter={filter}
            handleCategoryFilter={handleCategoryFilter}
            handleClearFilter={handleClearFilter}
          />
        </div> */}
      </div>
      <br />
      {groupByCategory(notCompletedItems)}

      <h2>Completed Items</h2>
      {groupByCategory(completedItems)}
    </React.Fragment>
  );
};

export default ListContainer;
