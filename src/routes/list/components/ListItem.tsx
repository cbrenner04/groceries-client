import React, { type ReactNode } from 'react';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { EUserPermissions } from 'typings';
import type { IListItem } from 'typings';
import { Complete, EditButton, Refresh, Trash } from 'components/ActionButtons';
import { itemName, secondaryFieldsDisplay } from '../utils';

export interface IListItemProps {
  item: IListItem;
  multiSelect?: boolean;
  permissions: EUserPermissions;
  pending: boolean;
  selectedItems: IListItem[];
  handleItemSelect: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => void;
  handleItemComplete: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
}

const ListItem: React.FC<IListItemProps> = (props): React.JSX.Element => {
  const multiSelect = props.multiSelect ?? false;

  const itemTitle = (): ReactNode => {
    const formattedName = itemName(props.item);
    const secondaryText = secondaryFieldsDisplay(props.item);
    if (!formattedName) {
      return <span>Untitled Item</span>;
    }
    return (
      <span className="list-item-content">
        <span>{formattedName}</span>
        {secondaryText && (
          <span className="list-item-secondary text-muted" style={{ fontSize: '0.85em', display: 'block' }}>
            {secondaryText}
          </span>
        )}
      </span>
    );
  };
  const multiSelectCheckbox = (item: IListItem): ReactNode | undefined =>
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
          {props.permissions === EUserPermissions.WRITE && (
            <ButtonGroup className={`${multiSelect ? 'list-item-buttons' : ''} float-end`}>
              {props.item.completed ? (
                <Refresh
                  handleClick={(): void => props.handleItemRefresh(props.item)}
                  testID={`completed-item-refresh-${props.item.id}`}
                  disabled={props.pending}
                />
              ) : (
                <Complete
                  handleClick={(): void => props.handleItemComplete(props.item)}
                  testID={`not-completed-item-complete-${props.item.id}`}
                  disabled={props.pending}
                />
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
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

// prevents re-renders when only irrelevant props change
// select prop monitoring to check for props that actually affect visual output
// can have significant performance benefits with large lists
export const memoCompare = (prev: IListItemProps, next: IListItemProps): boolean => {
  if (prev.pending !== next.pending) {
    return false;
  }
  if (prev.multiSelect !== next.multiSelect) {
    return false;
  }
  if (prev.permissions !== next.permissions) {
    return false;
  }
  if (prev.selectedItems.length !== next.selectedItems.length) {
    return false;
  }
  if (prev.item.id !== next.item.id) {
    return false;
  }
  if (prev.item.completed !== next.item.completed) {
    return false;
  }
  if (prev.item.updated_at !== next.item.updated_at) {
    return false;
  }
  return true;
};

export default React.memo(ListItem, memoCompare);
