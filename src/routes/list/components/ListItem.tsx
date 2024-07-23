import React from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';

import { prettyDueBy } from '../../../utils/format';
import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';
import { EListType, IListItem, IListUsers } from '../../../typings';

interface IListItemProps {
  item: IListItem;
  purchased?: boolean;
  listType: EListType;
  listUsers?: IListUsers[];
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

const ListItem: React.FC<IListItemProps> = (props) => {
  let assignee = '';
  if (props.listType === EListType.TO_DO_LIST && props.item.assignee_id) {
    const assignedUser = (props.listUsers ?? []).find((user) => user.id === props.item.assignee_id);
    if (assignedUser) {
      assignee = `Assigned To: ${assignedUser.email}`;
    }
  }

  return (
    <ListGroup.Item
      key={props.item.id}
      className="list-item-list-group-item"
      data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1">
            <input type="checkbox" className="multi-select-check" onClick={() => props.handleItemSelect(props.item)} />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>
            {itemName(props.item, props.listType)}
          </div>
          {props.listType === EListType.TO_DO_LIST && (
            <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>
              <small className="text-muted">
                <div data-test-id="assignee-email">{assignee}</div>
                <div data-test-id="due-by">{props.item.due_by ? `Due By: ${prettyDueBy(props.item.due_by)}` : ''}</div>
              </small>
            </div>
          )}
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
