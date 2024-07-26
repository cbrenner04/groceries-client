import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from '../utils/api';
import { UserContext } from '../AppRouter';

interface IAppNavProps {
  signOutUser: Function;
}

const AppNav: React.FC<IAppNavProps> = ({ signOutUser }): React.JSX.Element => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    signOutUser();
    toast('Log out successful', { type: 'info' });
    navigate('/users/sign_in');
  };

  const handleBrandClick = (): void => {
    const path = user ? '/' : '/users/sign_in';
    navigate(path);
  };

  return (
    <Navbar expand="lg" variant="light" bg="light" fixed="top" data-test-id="nav">
      <Navbar.Brand onClick={handleBrandClick}>Groceries</Navbar.Brand>
      {user && (
        <React.Fragment>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="me-auto">
              <Nav.Item>
                <Nav.Link onClick={(): void => navigate('/users/invitation/new')} data-test-id="invite-link">
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
        </React.Fragment>
      )}
    </Navbar>
  );
};

export default AppNav;
