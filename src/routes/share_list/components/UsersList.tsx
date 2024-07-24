import React from 'react';
import { Badge, Button, ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Trash } from '../../../components/ActionButtons';
import TitlePopover from '../../../components/TitlePopover';
import { IUsersList } from '../../../typings';

interface IUsersListProps {
  togglePermission: (id: string, permissions: string, status: string) => void;
  removeShare: (id: string) => void;
  userIsOwner: boolean;
  userId: string;
  status: string;
  users: IUsersList[];
}

const UsersList: React.FC<IUsersListProps> = (props) => (
  <>
    <TitlePopover
      title={props.status}
      message="Click the arrows to upgrade or downgrade the permissions between read and write"
    />
    <ListGroup className="mb-4">
      {props.users.map(({ user, users_list: { id, permissions } }) => {
        if (user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <ListGroup.Item
              key={id}
              data-test-id={`${props.status}-user-${user.id}`}
              className="users-list-list-group-item"
            >
              <Row>
                <Col md="6" className="pt-1">
                  {user.email}
                </Col>
                <Col md="4" className="pt-1">
                  <Badge data-test-id={`perm-${permissions}`} bg={permissions === 'write' ? 'success' : 'primary'}>
                    {permissions}
                  </Badge>
                </Col>
                <Col md="2">
                  <ButtonGroup className="float-end">
                    <Button
                      variant="link"
                      className="p-0 me-4"
                      onClick={() => props.togglePermission(id, permissions, props.status)}
                      data-test-id="toggle-permissions"
                    >
                      <i
                        className={`fas fa-angle-double-${permissions === 'write' ? 'down' : 'up'} fa-2x text-warning`}
                      />
                    </Button>
                    <Trash testID="remove-share" handleClick={() => props.removeShare(id)} />
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={id} data-test-id={`${props.status}-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </>
);

export default UsersList;
