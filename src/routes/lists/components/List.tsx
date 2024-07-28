import React, { type ReactElement } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { formatDate } from 'utils/format';
import listIconClass from 'utils/list_icon';
import type { IList } from 'typings';

export interface IListProps {
  listButtons: ReactElement;
  listName: string;
  listClass: string;
  testClass: string;
  includeLinkToList: boolean;
  list: IList;
  multiSelect: boolean;
  selectedLists: IList[];
  setSelectedLists: (lists: IList[]) => void;
}

const List: React.FC<IListProps> = (props): React.JSX.Element => {
  const handleListSelect = (list: IList): void => {
    const listIds = props.selectedLists.map((l) => l.id).join(',');
    let updatedLists;
    if (listIds.includes(list.id!)) {
      updatedLists = props.selectedLists.filter((l) => l.id !== list.id);
    } else {
      updatedLists = update(props.selectedLists, { $push: [list] });
    }
    props.setSelectedLists(updatedLists);
  };

  const listName = (
    <h5 className="mb-1">
      <i className={`fa ${listIconClass(props.list.type)} text-secondary me-3`} />
      {props.listName}
    </h5>
  );

  const listNameElement = props.includeLinkToList ? (
    <Link to={`/lists/${props.list.id}`} className="router-link">
      {listName}
    </Link>
  ) : (
    listName
  );

  return (
    <ListGroup.Item
      className={`${props.listClass} list-list-group-item`}
      data-test-class={props.testClass}
      data-test-id={`list-${props.list.id}`}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1" className="mx-sm-auto">
            <input type="checkbox" className="multi-select-check" onClick={(): void => handleListSelect(props.list)} />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <Row className={`${props.multiSelect ? 'ms-1' : ''} pt-1`}>
            <Col lg="6">{listNameElement}</Col>
            <Col lg="4" className={props.multiSelect ? 'list-multi-created-at' : ''}>
              <small className="text-muted">{formatDate(props.list.created_at!)}</small>
            </Col>
            <Col lg="2" className={`${props.multiSelect ? 'list-multi-buttons' : ''} pe-lg-3`}>
              {props.listButtons}
            </Col>
          </Row>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default List;
