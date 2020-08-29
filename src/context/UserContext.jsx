import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext({ user: null });

// TODO: this probably better off somewhere else
function UserContextProvider({ children }) {
  let defaultUser = null;
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  if (storedUser) {
    const { 'access-token': accessToken, client, uid } = storedUser;
    defaultUser = { accessToken, client, uid };
  }
  const [user, setUser] = useState(defaultUser);
  const signInUser = (accessToken, client, uid) => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': accessToken,
        client,
        uid,
      }),
    );
    setUser({ accessToken, client, uid });
  };
  const signOutUser = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };
  const userContext = {
    user,
    signInUser,
    signOutUser,
  };

  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
}

UserContextProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export { UserContext, UserContextProvider };
