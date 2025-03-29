import React, { useState, type ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';

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
  // TODO: remove disable
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [pending, setPending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IV2ListItem[]);
  const [incompleteMultiSelect, setIncompleteMultiSelect] = useState(false);
  const [completeMultiSelect, setCompleteMultiSelect] = useState(false);
  const navigate = useNavigate();

  // TODO: implement and remove disable
  /* eslint-disable no-console */
  const handleAddItem = (something: unknown): void => console.log(something);
  const handleItemSelect = (item: IV2ListItem): void => console.log(item);
  const handleItemComplete = (item: IV2ListItem): void => console.log(item);
  const handleItemEdit = (item: IV2ListItem): void => console.log(item);
  const handleItemDelete = (item: IV2ListItem): void => console.log(item);
  const handleItemRefresh = (item: IV2ListItem): void => console.log(item);

  const groupByCategory = (items: IV2ListItem[]): ReactNode =>
    // NOTE: adding `undefined` to handle uncategorized items
    [undefined, ...props.categories].map((category: string | undefined) => {
      const itemsToRender = items.filter((item: IV2ListItem) =>
        category
          ? item.fields.find((field: IListItemField) => field.label === 'category' && field.data === category)
          : !item.fields.find((field: IListItemField) => field.label === 'category'),
      );
      if (!itemsToRender.length) {
        return '';
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
                multiSelect={item.completed ? completeMultiSelect : incompleteMultiSelect}
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
        // TODO: need configuration with field configurations
        <ListItemForm
          listId={props.list.id!}
          listUsers={[]}
          userId={props.userId}
          handleItemAddition={handleAddItem}
          categories={props.categories}
          navigate={navigate}
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
      {groupByCategory(props.notCompletedItems)}

      <h2>Completed Items</h2>
      {groupByCategory(props.completedItems)}
    </React.Fragment>
  );
};

export default ListContainer;
