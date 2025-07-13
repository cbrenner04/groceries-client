import React, { type ReactNode } from 'react';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import type { EUserPermissions, IV2ListItem } from 'typings';
import { EListType } from 'typings';
import { Complete, EditButton, Refresh, Trash, Bookmark } from 'components/ActionButtons';
import { itemName } from '../utils';

export interface IListItemProps {
  item: IV2ListItem;
  multiSelect?: boolean;
  permissions: EUserPermissions;
  pending: boolean;
  selectedItems: IV2ListItem[];
  listType: EListType;
  handleItemSelect: (item: IV2ListItem) => void;
  handleItemRefresh: (item: IV2ListItem) => void;
  handleItemComplete: (item: IV2ListItem) => void;
  handleItemEdit: (item: IV2ListItem) => void;
  handleItemDelete: (item: IV2ListItem) => void;
  toggleItemRead?: (item: IV2ListItem) => void;
}

const ListItem: React.FC<IListItemProps> = (props): React.JSX.Element => {
  const multiSelect = props.multiSelect ?? false;

  const getReadStatus = (): boolean => {
    return props.item.fields.find((field) => field.label === 'read')?.data === 'true';
  };

  const itemTitle = (): ReactNode => {
    const formattedName = itemName(props.item, props.listType);
    if (!formattedName) {
      return <span>Untitled Item</span>;
    }
    return <span>{formattedName}</span>;
  };
  const multiSelectCheckbox = (item: IV2ListItem): ReactNode | undefined =>
    multiSelect && (
      <Col xs="1">
        <input
          type="checkbox"
          className="multi-select-check"
          data-test-id={`${item.completed ? 'completed' : 'not-completed'}-item-select-${item.id}`}
          onClick={(): void => props.handleItemSelect(item)}
        />
        <div className="list-item-multi-divider"></div>
      </Col>
    );
  return (
    <ListGroup.Item
      key={props.item.id}
      className="list-item-list-group-item"
      data-test-class={props.item.completed ? 'completed-item' : 'non-completed-item'}
    >
      <Row className={multiSelect ? 'list-item-row' : ''}>
        {multiSelectCheckbox(props.item)}
        <Col xs={multiSelect ? 10 : 12} sm={multiSelect ? 11 : 12}>
          {itemTitle()}
          <ButtonGroup className={`${multiSelect ? 'list-item-buttons' : ''} float-end`}>
            {props.item.completed ? (
              <>
                {props.listType === EListType.BOOK_LIST && props.toggleItemRead && (
                  <Bookmark
                    handleClick={(): void => props.toggleItemRead!(props.item)}
                    read={getReadStatus()}
                    testID={`completed-item-${getReadStatus() ? 'unread' : 'read'}-${props.item.id}`}
                  />
                )}
                <Refresh
                  handleClick={(): void => props.handleItemRefresh(props.item)}
                  testID={`completed-item-refresh-${props.item.id}`}
                  disabled={props.pending}
                />
              </>
            ) : (
              <>
                {props.listType === EListType.BOOK_LIST && props.toggleItemRead && (
                  <Bookmark
                    handleClick={(): void => props.toggleItemRead!(props.item)}
                    read={getReadStatus()}
                    testID={`not-completed-item-${getReadStatus() ? 'unread' : 'read'}-${props.item.id}`}
                  />
                )}
                <Complete
                  handleClick={(): void => props.handleItemComplete(props.item)}
                  testID={`not-completed-item-complete-${props.item.id}`}
                  disabled={props.pending}
                />
              </>
            )}
            <EditButton
              handleClick={(): void => props.handleItemEdit(props.item)}
              testID={`${props.item.completed ? '' : 'not-'}completed-item-edit-${props.item.id}`}
              disabled={props.pending}
            />
            <Trash
              handleClick={(): void => props.handleItemDelete(props.item)}
              testID={`${props.item.completed ? '' : 'not-'}completed-item-delete-${props.item.id}`}
              disabled={props.pending}
            />
          </ButtonGroup>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default ListItem;
