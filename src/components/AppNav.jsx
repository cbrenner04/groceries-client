import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from '../utils/api';
import { UserContext } from '../context/UserContext';

export default function AppNav() {
  const history = useHistory();
  const { user, signOutUser } = useContext(UserContext);

  const handleLogout = async () => {
    signOutUser();
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    toast('Log out successful', { type: 'info' });
    history.push('/users/sign_in');
  };

  return (
    <Navbar expand="lg" variant="light" bg="light" fixed="top" data-test-id="nav">
      <Navbar.Brand href={user ? '/' : '/users/sign_in'}>Groceries</Navbar.Brand>
      {user && (
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
