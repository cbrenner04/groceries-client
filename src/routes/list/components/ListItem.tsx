import React from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';

import { prettyDueBy } from 'utils/format';
import { EListType, type IListItem, type IListUser } from 'typings';

import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';

export interface IListItemProps {
  item: IListItem;
  purchased?: boolean;
  listType: EListType;
  listUsers?: IListUser[];
  permission: string;
  multiSelect: boolean;
  handleItemDelete: (item: IListItem) => void;
  handlePurchaseOfItem: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => void;
  handleItemSelect: (item: IListItem) => void;
  toggleItemRead: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  selectedItems: IListItem[];
  pending: boolean;
}

const ListItem: React.FC<IListItemProps> = (props): React.JSX.Element => {
  let assignee = '';
  if (props.listType === EListType.TO_DO_LIST && props.item.assignee_id) {
    const assignedUser = (props.listUsers ?? []).find((user) => user.id === props.item.assignee_id);
    if (assignedUser) {
      assignee = `Assigned To: ${assignedUser.email}`;
    }
  }

  const multiSelectCheckbox = props.multiSelect && (
    <Col xs="1">
      <input type="checkbox" className="multi-select-check" onClick={(): void => props.handleItemSelect(props.item)} />
      <div className="list-item-multi-divider"></div>
    </Col>
  );

  const itemTitle = (
    <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>{itemName(props.item, props.listType)}</div>
  );

  const extraInfo = props.listType === EListType.TO_DO_LIST && (
    <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>
      <small className="text-muted">
        <div data-test-id="assignee-email">{assignee}</div>
        <div data-test-id="due-by">{props.item.due_by ? `Due By: ${prettyDueBy(props.item.due_by)}` : ''}</div>
      </small>
    </div>
  );

  return (
    <ListGroup.Item
      key={props.item.id}
      className="list-item-list-group-item"
      data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {multiSelectCheckbox}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          {itemTitle}
          {extraInfo}
          {props.permission === 'write' && (
            <ListItemButtons
              purchased={props.purchased ?? false}
              listType={props.listType}
              item={props.item}
              handleItemRefresh={props.handleItemRefresh}
              handleItemDelete={props.handleItemDelete}
              handlePurchaseOfItem={props.handlePurchaseOfItem}
              toggleItemRead={props.toggleItemRead}
              handleItemEdit={props.handleItemEdit}
              multiSelect={props.multiSelect}
              selectedItems={props.selectedItems}
              pending={props.pending}
            />
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default ListItem;
