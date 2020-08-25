import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext({ user: null });

// TODO: this probably better off somewhere else
function UserContextProvider(props) {
  const [user, setUser] = useState(null);
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

  return <UserContext.Provider value={userContext}>{props.children}</UserContext.Provider>;
}

UserContextProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export { UserContext, UserContextProvider };
