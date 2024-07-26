import React from 'react';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Refresh } from '../../../components/ActionButtons';
import type { IUsersList } from '../../../typings';

interface IRefusedUsersListProps {
  refreshShare: (id: string, userId: string) => void;
  userIsOwner: boolean;
  userId: string;
  users: IUsersList[];
}

const RefusedUsersList: React.FC<IRefusedUsersListProps> = (props) => (
  <>
    <h2>Refused</h2>
    <ListGroup>
      {props.users.map(({ user, users_list: { id } }) => {
        if (user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <ListGroup.Item key={id} data-test-id={`refused-user-${user.id}`} className="refused-list-list-group-item">
              <Row>
                <Col md="6" className="pt-1">
                  {user.email}
                </Col>
                <Col md="4" className="pt-1"></Col>
                <Col md="2">
                  <ButtonGroup className="float-end">
                    <Refresh testID="refresh-share" handleClick={() => props.refreshShare(id, user.id)} />
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={id} data-test-id={`refused-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </>
);

export default RefusedUsersList;
