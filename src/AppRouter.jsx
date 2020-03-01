import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import CompletedLists from './routes/lists/CompletedLists';
import EditInvite from './routes/users/EditInvite';
import EditListItemForm from './routes/list/EditListItemForm';
import EditPassword from './routes/users/EditPassword';
import InviteForm from './routes/users/InviteForm';
import ListContainer from './routes/list/ListContainer';
import EditListForm from './routes/list//EditListForm';
import ListsContainer from './routes/lists/ListsContainer';
import Navbar from './components/Navbar';
import NewPassword from './routes/users/NewPassword';
import NewSession from './routes/users/NewSession';
import ShareListForm from './routes/share_list/ShareListForm';
import PageNotFound from './routes/error_pages/PageNotFound';

export default function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Switch>
        {/* routes/lists */}
        <Route exact path="/" component={ListsContainer} />
        <Route exact path="/lists" component={ListsContainer} />
        <Route exact path="/completed_lists" component={CompletedLists} />
        {/* routes/list */}
        <Route exact path="/lists/:id" component={ListContainer} />
        <Route exact path="/lists/:id/edit" component={EditListForm} />
        <Route path="/lists/:list_id/*/:id/edit" component={EditListItemForm} />
        {/* routes/share_list */}
        <Route exact path="/lists/:list_id/users_lists" component={ShareListForm} />
        {/* routes/users */}
        <Route exact path="/users/sign_in" component={NewSession} />
        <Route exact path="/users/password/new" component={NewPassword} />
        <Route exact path="/users/password/edit" component={EditPassword} />
        <Route exact path="/users/invitation/new" component={InviteForm} />
        <Route exact path="/users/invitation/accept" component={EditInvite} />
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}
