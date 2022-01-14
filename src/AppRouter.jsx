import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import CompletedLists from './routes/lists/CompletedLists';
import EditInvite from './routes/users/EditInvite';
import EditListItem from './routes/list/EditListItem';
import BulkEditListItems from './routes/list/BulkEditListItems';
import EditPassword from './routes/users/EditPassword';
import InviteForm from './routes/users/InviteForm';
import List from './routes/list/List';
import EditList from './routes/lists/EditList';
import Lists from './routes/lists/Lists';
import AppNav from './components/AppNav';
import NewPassword from './routes/users/NewPassword';
import NewSession from './routes/users/NewSession';
import ShareList from './routes/share_list/ShareList';
import PageNotFound from './routes/error_pages/PageNotFound';

export const UserContext = createContext(null);

export default function AppRouter() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      const { 'access-token': accessToken, client, uid } = storedUser;
      setUser({ accessToken, client, uid });
    }
  }, []);

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

  return (
    <Router>
      <UserContext.Provider value={user}>
        <AppNav signOutUser={signOutUser} />
        <Routes>
          {/* routes/lists */}
          <Route exact path="/" element={<Navigate to="/lists" />} />
          <Route exact path="/lists" element={<Lists />} />
          <Route exact path="/completed_lists" element={<CompletedLists />} />
          {/* routes/list */}
          <Route exact path="/lists/:id" element={<List />} />
          <Route exact path="/lists/:id/edit" element={<EditList />} />
          <Route exact path="/lists/:list_id/list_items/:id/edit" element={<EditListItem />} />
          <Route exact path="/lists/:list_id/list_items/bulk-edit" element={<BulkEditListItems />} />
          {/* routes/share_list */}
          <Route exact path="/lists/:list_id/users_lists" element={<ShareList />} />
          {/* routes/users */}
          <Route exact path="/users/sign_in" element={<NewSession signInUser={signInUser} />} />
          <Route exact path="/users/password/new" element={<NewPassword />} />
          <Route exact path="/users/password/edit" element={<EditPassword />} />
          <Route exact path="/users/invitation/new" element={<InviteForm />} />
          <Route exact path="/users/invitation/accept" element={<EditInvite />} />
          {/* routes/error_pages */}
          <Route component={PageNotFound} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}
