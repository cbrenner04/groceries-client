import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

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

export default function AppRouter() {
  return (
    <Router>
      <AppNav />
      <Switch>
        {/* routes/lists */}
        <Redirect exact path="/" to="/lists" />
        <Route exact path="/lists" component={Lists} />
        <Route exact path="/completed_lists" component={CompletedLists} />
        {/* routes/list */}
        <Route exact path="/lists/:id" component={List} />
        <Route exact path="/lists/:id/edit" component={EditList} />
        <Route path="/lists/:list_id/*/:id/edit" component={EditListItem} />
        <Route path="/lists/:list_id/*/bulk-edit" component={BulkEditListItems} />
        {/* routes/share_list */}
        <Route exact path="/lists/:list_id/users_lists" component={ShareList} />
        {/* routes/users */}
        <Route exact path="/users/sign_in" component={NewSession} />
        <Route exact path="/users/password/new" component={NewPassword} />
        <Route exact path="/users/password/edit" component={EditPassword} />
        <Route exact path="/users/invitation/new" component={InviteForm} />
        <Route exact path="/users/invitation/accept" component={EditInvite} />
        {/* routes/error_pages */}
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}
