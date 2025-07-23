import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';

import CompletedLists from './routes/lists/CompletedLists';
import EditInvite from './routes/users/EditInvite';
import EditPassword from './routes/users/EditPassword';
import InviteForm from './routes/users/InviteForm';
import Lists from './routes/lists/Lists';
import AppNav from './components/AppNav';
import NewPassword from './routes/users/NewPassword';
import NewSession from './routes/users/NewSession';
import ShareList from './routes/share_list/ShareList';
import PageNotFound from './routes/error_pages/PageNotFound';
import V2List from './routes/v2/list/List';
import V2EditList from './routes/v2/list/EditList';
import V2EditListItem from './routes/v2/list/EditListItem';
import V2BulkEditListItems from './routes/v2/list/BulkEditListItems';

interface IUser {
  accessToken: string;
  client: string;
  uid: string;
}

export const UserContext = createContext<IUser | null>(null);

export default function AppRouter(): React.JSX.Element {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      const storedUser: { 'access-token': string; client: string; uid: string } = JSON.parse(sessionUser);
      const { 'access-token': accessToken, client, uid } = storedUser;
      setUser({ accessToken, client, uid });
    }
  }, []);

  const signInUser = (accessToken: string, client: string, uid: string): void => {
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

  const signOutUser = (): void => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <Router>
      <UserContext.Provider value={user}>
        <AppNav signOutUser={signOutUser} />
        <Routes>
          {/* routes/lists */}
          <Route path="/" element={<Navigate to="/lists" />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/completed_lists" element={<CompletedLists />} />
          {/* routes/v2/list */}
          <Route path="/v2/lists/:id" element={<V2List />} />
          <Route path="/v2/lists/:id/edit" element={<V2EditList />} />
          <Route path="/v2/lists/:list_id/list_items/:id/edit" element={<V2EditListItem />} />
          <Route path="/v2/lists/:list_id/list_items/bulk-edit" element={<V2BulkEditListItems />} />
          {/* routes/share_list */}
          <Route path="/lists/:list_id/users_lists" element={<ShareList />} />
          {/* routes/users */}
          <Route path="/users/sign_in" element={<NewSession signInUser={signInUser} />} />
          <Route path="/users/password/new" element={<NewPassword />} />
          <Route path="/users/password/edit" element={<EditPassword />} />
          <Route path="/users/invitation/new" element={<InviteForm />} />
          <Route path="/users/invitation/accept" element={<EditInvite />} />
          {/* routes/error_pages */}
          <Route errorElement={<PageNotFound />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}
