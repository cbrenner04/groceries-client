import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import axios from '../utils/api';
import { UserContext } from '../AppRouter';

function AppNav({ signOutUser }) {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    signOutUser();
    toast('Log out successful', { type: 'info' });
    navigate('/users/sign_in');
  };

  const handleBrandClick = () => {
    const path = user ? '/' : '/users/sign_in';
    navigate(path);
  };

  return (
    <Navbar expand="lg" variant="light" bg="light" fixed="top" data-test-id="nav">
      <Navbar.Brand onClick={handleBrandClick}>Groceries</Navbar.Brand>
      {user && (
        <>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="me-auto">
              <Nav.Item>
                <Nav.Link onClick={() => navigate('/users/invitation/new')} data-test-id="invite-link">
                  Invite
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link data-test-id="log-out-link" onClick={handleLogout}>
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

AppNav.propTypes = {
  signOutUser: PropTypes.func.isRequired,
};

export default AppNav;
