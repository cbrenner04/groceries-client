import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import axios from '../utils/api';

export default function AppNav() {
  const history = useHistory();
  const userIsSignedIn = !!JSON.parse(sessionStorage.getItem('user'));

  const handleLogout = async () => {
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    sessionStorage.removeItem('user');
    history.push('/users/sign_in');
  };

  return (
    <Navbar expand="lg" variant="light" bg="light" fixed="top">
      <Navbar.Brand href={userIsSignedIn ? '/' : '/users/sign_in'}>Groceries</Navbar.Brand>
      {userIsSignedIn && (
        <>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="mr-auto">
              <Nav.Item>
                <Nav.Link href="/users/invitation/new" data-test-id="invite-link">
                  Invite
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#" data-test-id="log-out-link" onSelect={handleLogout}>
                  Log out
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </>
      )}
    </Navbar>
  );
}
