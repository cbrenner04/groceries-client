import React from 'react';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Refresh } from 'components/ActionButtons';
import type { IUsersList } from 'typings';

export interface IRefusedUsersListProps {
  refreshShare: (id: string, userId: string) => void;
  userIsOwner: boolean;
  userId: string;
  users: IUsersList[];
}

const RefusedUsersList: React.FC<IRefusedUsersListProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <h2>Refused</h2>
    <ListGroup>
      {props.users.map((user) => {
        if (user.user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <ListGroup.Item
              key={user.users_list.id}
              data-test-id={`refused-user-${user.user.id}`}
              className="refused-list-list-group-item"
            >
              <Row>
                <Col md="6" className="pt-1">
                  {user.user.email}
                </Col>
                <Col md="4" className="pt-1"></Col>
                <Col md="2">
                  <ButtonGroup className="float-end">
                    <Refresh
                      testID="refresh-share"
                      handleClick={(): void => props.refreshShare(user.users_list.id, user.user.id)}
                    />
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={user.users_list.id} data-test-id={`refused-user-${user.user.id}`}>
            <ListGroup.Item>{user.user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </React.Fragment>
);

export default RefusedUsersList;
