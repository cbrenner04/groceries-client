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
import PageNotFound from './routes/error_pages/PageNotFound';
import List from './routes/list/List';
import EditListItem from './routes/list/EditListItem';

// Lazy load heavy administrative/infrequent components for better Mobile Safari performance
import { createLazyComponent, preloadComponent } from './utils/lazyComponents';

const ShareList = createLazyComponent(() => import('./routes/share_list/ShareList'));
const EditList = createLazyComponent(() => import('./routes/list/EditList'));
const BulkEditListItems = createLazyComponent(() => import('./routes/list/BulkEditListItems'));

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

  // Preload heavy components during idle time for better perceived performance
  useEffect(() => {
    preloadComponent(() => import('./routes/share_list/ShareList'));
    preloadComponent(() => import('./routes/list/EditList'));
    preloadComponent(() => import('./routes/list/BulkEditListItems'));
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
          {/* routes/list */}
          <Route path="/lists/:id" element={<List />} />
          <Route path="/lists/:id/edit" element={<EditList />} />
          <Route path="/lists/:list_id/list_items/:id/edit" element={<EditListItem />} />
          <Route path="/lists/:list_id/list_items/bulk-edit" element={<BulkEditListItems />} />
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
