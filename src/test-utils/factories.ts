import { EListItemFieldType, EUserPermissions } from 'typings';
import type { IList, IListItemField, IListUser, IListItemConfiguration, IListItem } from 'typings';

// Base date for consistent test data
const BASE_DATE = new Date('05/24/2020').toISOString();

// Interface for API response data
export interface IApiResponseData {
  current_user_id: string;
  not_completed_items: IListItem[];
  completed_items: IListItem[];
  list: IList;
  categories: string[];
  list_users: IListUser[];
  permissions: EUserPermissions;
  lists_to_update: IList[];
  list_item_configurations: IListItemConfiguration[];
  list_item_configuration: IListItemConfiguration;
}

// Helper to create a field
export function createField(
  id: string,
  label: string,
  data: string,
  listItemId: string,
  overrides?: Partial<IListItemField>,
): IListItemField {
  return {
    id,
    list_item_field_configuration_id: id,
    data,
    archived_at: null,
    list_item_id: listItemId,
    label,
    user_id: 'id1',
    created_at: BASE_DATE,
    updated_at: BASE_DATE,
    position: overrides?.position !== undefined ? overrides.position : 0,
    data_type: overrides?.data_type !== undefined ? overrides.data_type : EListItemFieldType.FREE_TEXT,
    ...overrides,
  };
}

// Helper to create a list item
export function createListItem(
  id: string,
  completed = false,
  fields: IListItemField[] = [],
  overrides?: Partial<IListItem>,
): IListItem {
  return {
    id,
    refreshed: false,
    completed,
    archived_at: null,
    user_id: 'id1',
    list_id: 'id1',
    created_at: BASE_DATE,
    updated_at: BASE_DATE,
    fields,
    ...overrides,
  };
}

// Helper to create a list
export function createList(
  id = 'id1',
  name = 'foo',
  listItemConfigurationId = 'config-id1',
  overrides?: Partial<IList>,
): IList {
  return {
    id,
    name,
    list_item_configuration_id: listItemConfigurationId,
    created_at: BASE_DATE,
    completed: false,
    owner_id: 'id1',
    refreshed: false,
    ...overrides,
  };
}

// Helper to create a list user
export function createListUser(id = 'id1', email = 'foo@example.com', overrides?: Partial<IListUser>): IListUser {
  return {
    id,
    email,
    ...overrides,
  };
}

// Helper to create a list item configuration
export function createListItemConfiguration(
  id = 'id1',
  name = 'foo',
  overrides?: Partial<IListItemConfiguration>,
): IListItemConfiguration {
  return {
    id,
    name,
    created_at: BASE_DATE,
    updated_at: BASE_DATE,
    user_id: 'id1',
    archived_at: null,
    ...overrides,
  };
}

// Pre-built test data sets
export const defaultTestData = {
  // Default list
  list: createList(),

  // Default completed item with quantity and product fields
  completedItem: createListItem('id1', true, [
    createField('id1', 'quantity', 'completed quantity', 'id1'),
    createField('id2', 'product', 'foo completed product', 'id1'),
  ]),

  // Default not completed items
  notCompletedItems: [
    // Item with no category
    createListItem('id2', false, [
      createField('id2', 'quantity', 'not completed quantity', 'id2'),
      createField('id3', 'product', 'no category not completed product', 'id2'),
    ]),
    // Item with foo category
    createListItem('id3', false, [
      createField('id4', 'quantity', 'not completed quantity', 'id3'),
      createField('id5', 'product', 'foo not completed product', 'id3'),
      createField('id6', 'category', 'foo', 'id3'),
    ]),
    // Another item with foo category
    createListItem('id4', false, [
      createField('id7', 'quantity', 'not completed quantity', 'id4'),
      createField('id8', 'product', 'foo not completed product 2', 'id4'),
      createField('id9', 'category', 'foo', 'id4'),
    ]),
    // Item with bar category
    createListItem('id5', false, [
      createField('id10', 'quantity', 'not completed quantity', 'id5'),
      createField('id11', 'product', 'bar not completed product', 'id5'),
      createField('id12', 'category', 'bar', 'id5'),
    ]),
  ],

  // Default categories
  categories: ['foo', 'bar'],

  // Default list users
  listUsers: [createListUser()],

  // Default lists to update
  listsToUpdate: [createList('id2', 'bar')],

  // Default list item configuration
  listItemConfiguration: createListItemConfiguration(),

  // Default list item configurations (empty array)
  listItemConfigurations: [],

  // Default permissions
  permissions: EUserPermissions.WRITE,

  // Default user ID
  userId: 'id1',
};

// Helper to create API response data
export function createApiResponse(
  notCompletedItems: IListItem[] = defaultTestData.notCompletedItems,
  completedItems: IListItem[] = [defaultTestData.completedItem],
  overrides?: Partial<IApiResponseData>,
): IApiResponseData {
  return {
    current_user_id: 'id1',
    not_completed_items: notCompletedItems,
    completed_items: completedItems,
    list: defaultTestData.list,
    categories: defaultTestData.categories,
    list_users: defaultTestData.listUsers,
    permissions: defaultTestData.permissions,
    lists_to_update: defaultTestData.listsToUpdate,
    list_item_configurations: defaultTestData.listItemConfigurations,
    list_item_configuration: defaultTestData.listItemConfiguration,
    ...overrides,
  };
}
