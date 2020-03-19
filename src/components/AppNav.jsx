import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function AppNav() {
  const history = useHistory();
  const location = useLocation();
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  const handleLogout = () => {
    axios.delete(`${process.env.REACT_APP_API_BASE}/auth/sign_out`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).finally(() => {
      sessionStorage.removeItem('user');
      history.push('/users/sign_in');
    });
  }

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    setIsUserSignedIn(user);
  }, [location])

  return (
    <Navbar expand="lg" variant="light" bg="light" fixed="top">
      <Navbar.Brand href={isUserSignedIn ? '/' : '/users/sign_in'}>Groceries</Navbar.Brand>
      {
        isUserSignedIn &&
          <>
            <Navbar.Toggle aria-controls="navbar" />
            <Navbar.Collapse id="navbar">
              <Nav className="mr-auto">
                <Nav.Item>
                  <Nav.Link href="/users/invitation/new" data-test-id="invite-link">Invite</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#" data-test-id="log-out-link" onSelect={handleLogout}>Log out</Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </>
      }
    </Navbar>
  );
}
