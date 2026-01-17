import React from 'react';
import { Badge, Button, ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Trash } from 'components/ActionButtons';
import { AngleDoubleDownIcon, AngleDoubleUpIcon } from 'components/icons';
import TitlePopover from 'components/TitlePopover';
import type { IUsersList } from 'typings';

export interface IUsersListProps {
  togglePermission: (id: string, permissions: string, status: string) => void;
  removeShare: (id: string) => void;
  userIsOwner: boolean;
  userId: string;
  status: string;
  users: IUsersList[];
}

const UsersList: React.FC<IUsersListProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <TitlePopover
      title={props.status}
      message="Click the arrows to upgrade or downgrade the permissions between read and write"
    />
    <ListGroup className="mb-4">
      {props.users.map((user) => {
        if (user.user.id === props.userId) {
          return '';
        }
        const { permissions } = user.users_list;
        if (props.userIsOwner) {
          return (
            <ListGroup.Item
              key={user.users_list.id}
              data-test-id={`${props.status}-user-${user.user.id}`}
              className="users-list-list-group-item"
            >
              <Row>
                <Col md="6" className="pt-1">
                  {user.user.email}
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
                      className="p-0 me-4 text-warning"
                      onClick={(): void => props.togglePermission(user.users_list.id, permissions, props.status)}
                      data-test-id="toggle-permissions"
                    >
                      {permissions === 'write' ? <AngleDoubleDownIcon size="2x" /> : <AngleDoubleUpIcon size="2x" />}
                    </Button>
                    <Trash testID="remove-share" handleClick={(): void => props.removeShare(user.users_list.id)} />
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={user.users_list.id} data-test-id={`${props.status}-user-${user.user.id}`}>
            <ListGroup.Item>{user.user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </React.Fragment>
);

export default UsersList;
