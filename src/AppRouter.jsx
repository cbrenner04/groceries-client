import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import actioncable from 'actioncable';

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
import { ActionCableContext } from './context/ActionCableContext';

export const UserContext = createContext(null);

export default function AppRouter() {
  const [user, setUser] = useState(null);
  const [cableContext, setCableContext] = useState({ cable: null });

  const createUser = (accessToken, client, uid) => {
    const wsUrl = `${process.env.REACT_APP_WS_BASE}/?access-token=${accessToken}&uid=${uid}&client=${client}`;
    const cable = actioncable.createConsumer(wsUrl);
    setUser({ accessToken, client, uid });
    setCableContext({ cable, setCableContext });
  };

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      const { 'access-token': accessToken, client, uid } = storedUser;
      createUser(accessToken, client, uid);
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
    createUser(accessToken, client, uid);
  };

  const signOutUser = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    setCableContext({ cable: null, setCableContext: null });
  };

  return (
    <Router>
      <UserContext.Provider value={user}>
        <ActionCableContext.Provider value={cableContext}>
          <AppNav signOutUser={signOutUser} />
          <Switch>
            {/* routes/lists */}
            <Redirect exact path="/" to="/lists" />
            <Route exact path="/lists" component={Lists} />
            <Route exact path="/completed_lists" component={CompletedLists} />
            {/* routes/list */}
            <Route exact path="/lists/:id" component={List} />
            <Route exact path="/lists/:id/edit" component={EditList} />
            <Route exact path="/lists/:list_id/list_items/:id/edit" component={EditListItem} />
            <Route exact path="/lists/:list_id/list_items/bulk-edit" component={BulkEditListItems} />
            {/* routes/share_list */}
            <Route exact path="/lists/:list_id/users_lists" component={ShareList} />
            {/* routes/users */}
            <Route exact path="/users/sign_in" render={(props) => <NewSession signInUser={signInUser} {...props} />} />
            <Route exact path="/users/password/new" component={NewPassword} />
            <Route exact path="/users/password/edit" component={EditPassword} />
            <Route exact path="/users/invitation/new" component={InviteForm} />
            <Route exact path="/users/invitation/accept" component={EditInvite} />
            {/* routes/error_pages */}
            <Route component={PageNotFound} />
          </Switch>
        </ActionCableContext.Provider>
      </UserContext.Provider>
    </Router>
  );
}
