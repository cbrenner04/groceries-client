import React, { type ReactNode } from 'react';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import type { EUserPermissions, IListItemField, IV2ListItem } from 'typings';
import { Complete, EditButton, Refresh, Trash } from 'components/ActionButtons';

interface IListItemProps {
  item: IV2ListItem;
  multiSelect?: boolean;
  permissions: EUserPermissions;
  pending: boolean;
  selectedItems: IV2ListItem[];
  handleItemSelect: (item: IV2ListItem) => void;
  handleItemRefresh: (item: IV2ListItem) => void;
  handleItemComplete: (item: IV2ListItem) => void;
  handleItemEdit: (item: IV2ListItem) => void;
  handleItemDelete: (item: IV2ListItem) => void;
}

const ListItem: React.FC<IListItemProps> = (props): React.JSX.Element => {
  const multiSelect = props.multiSelect ?? false;
  const itemTitle = (fields: IListItemField[]): ReactNode => {
    // Defensive: handle undefined or null fields
    const safeFields = Array.isArray(fields) ? fields : [];
    if (safeFields.length === 0) {
      return <span>Untitled Item</span>;
    }
    return safeFields.map(
      (field: IListItemField) => field.label !== 'category' && <span key={field.id}>{field.data} </span>,
    );
  };
  const multiSelectCheckbox = (item: IV2ListItem): ReactNode | undefined =>
    multiSelect && (
      <Col xs="1">
        <input type="checkbox" className="multi-select-check" onClick={(): void => props.handleItemSelect(item)} />
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
          {itemTitle(props.item.fields)}
          <ButtonGroup className={`${multiSelect ? 'list-item-buttons' : ''} float-end`}>
            {props.item.completed ? (
              <Refresh
                handleClick={(): void => props.handleItemRefresh(props.item)}
                testID={`purchased-item-refresh-${props.item.id}`}
                disabled={props.pending}
              />
            ) : (
              <Complete
                handleClick={(): void => props.handleItemComplete(props.item)}
                testID={`not-purchased-item-complete-${props.item.id}`}
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
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default ListItem;
