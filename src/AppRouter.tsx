import React, { createContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { PageTransition, type TPageTransitionDirection } from './components/layout/PageTransition';

// Portal target for BottomInputBar, positioned outside PageTransition
// so the bar's position: fixed resolves against the viewport, not the transform ancestor.
export const BOTTOM_INPUT_BAR_PORTAL_TARGET_ID = 'bottom-input-bar-portal-target';

import CompletedLists from './routes/lists/CompletedLists';
import EditInvite from './routes/users/EditInvite';
import EditPassword from './routes/users/EditPassword';
import InviteForm from './routes/users/InviteForm';
import Lists from './routes/lists/Lists';
import Templates from './routes/templates/Templates';
import NewPassword from './routes/users/NewPassword';
import NewSession from './routes/users/NewSession';
import PageNotFound from './routes/error_pages/PageNotFound';
import List from './routes/list/List';
import EditListItem from './routes/list/EditListItem';
import { ThemeProvider } from './components/ThemeProvider';
import { SettingsMenu } from './components/domain/SettingsMenu';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { showToast } from './utils/toast';
import axios from './utils/api';

// Lazy load heavy administrative/infrequent components for better Mobile Safari performance
import { createLazyComponent, preloadComponent } from './utils/lazyComponents';

const ShareList = createLazyComponent(() => import('./routes/share_list/ShareList'));
const BulkEditListItems = createLazyComponent(() => import('./routes/list/BulkEditListItems'));

function routeDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length;
}

function transitionDirection(previousPathname: string, nextPathname: string): TPageTransitionDirection {
  const previousDepth = routeDepth(previousPathname);
  const nextDepth = routeDepth(nextPathname);

  if (nextDepth > previousDepth) {
    return 'forward';
  }

  if (nextDepth < previousDepth) {
    return 'back';
  }

  return 'fade';
}

interface IUser {
  accessToken: string;
  client: string;
  uid: string;
}

export const UserContext = createContext<IUser | null>(null);

interface IAppRouterContentProps {
  signInUser: (accessToken: string, client: string, uid: string) => void;
  signOutUser: () => void;
  user: IUser | null;
}

function AppRouterContent(props: IAppRouterContentProps): React.JSX.Element {
  const { signInUser, signOutUser, user } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const previousPathname = useRef(location.pathname);
  const pageTransitionDirection = transitionDirection(previousPathname.current, location.pathname);

  const isAuthPage =
    location.pathname === '/users/sign_in' ||
    location.pathname === '/users/password/new' ||
    location.pathname === '/users/password/edit' ||
    location.pathname === '/users/invitation/accept';
  const showBottomNav = Boolean(user) && !isAuthPage;

  useEffect(() => {
    if (!showBottomNav) {
      setSettingsMenuOpen(false);
    }
  }, [showBottomNav]);

  useEffect(() => {
    setSettingsMenuOpen(false);
    previousPathname.current = location.pathname;
  }, [location.pathname]);

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.delete('/auth/sign_out');
    } catch {
      // noop
    }
    setSettingsMenuOpen(false);
    signOutUser();
    showToast.info('Log out successful');
    navigate('/users/sign_in');
  };

  const handleBottomNavClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    const settingsTrigger = target.closest('[data-test-id="nav-settings"]');
    const clickedWithinNav = settingsTrigger instanceof HTMLElement && event.currentTarget.contains(settingsTrigger);

    if (clickedWithinNav) {
      event.preventDefault();
      setSettingsMenuOpen((current) => !current);
      return;
    }

    if (settingsMenuOpen) {
      setSettingsMenuOpen(false);
    }
  };

  const handleSettingsMenuClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    if (target.closest('[data-test-id="log-out-link"]')) {
      event.preventDefault();
      void handleLogout();
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname} direction={pageTransitionDirection} data-test-id="page-transition">
          <Routes>
            {/* routes/lists */}
            <Route path="/" element={<Navigate to="/lists" />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/completed_lists" element={<CompletedLists />} />
            {/* routes/list */}
            <Route path="/lists/:id" element={<List />} />
            <Route path="/lists/:list_id/list_items/:id/edit" element={<EditListItem />} />
            <Route path="/lists/:list_id/list_items/bulk-edit" element={<BulkEditListItems />} />
            {/* routes/share_list */}
            <Route path="/lists/:list_id/users_lists" element={<ShareList />} />
            {/* routes/templates */}
            <Route path="/templates" element={<Templates />} />
            {/* routes/users */}
            <Route path="/users/sign_in" element={<NewSession signInUser={signInUser} />} />
            <Route path="/users/password/new" element={<NewPassword />} />
            <Route path="/users/password/edit" element={<EditPassword />} />
            <Route path="/users/invitation/new" element={<InviteForm />} />
            <Route path="/users/invitation/accept" element={<EditInvite />} />
            {/* routes/error_pages */}
            <Route errorElement={<PageNotFound />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
      {/* Portal target for BottomInputBar: positioned outside PageTransition */}
      <div id={BOTTOM_INPUT_BAR_PORTAL_TARGET_ID} />
      {showBottomNav ? (
        <div onClickCapture={handleBottomNavClickCapture}>
          <BottomNavBar currentPath={settingsMenuOpen ? '/settings' : location.pathname} />
        </div>
      ) : null}
      {showBottomNav ? (
        <div onClickCapture={handleSettingsMenuClickCapture}>
          <SettingsMenu isOpen={settingsMenuOpen} onClose={() => setSettingsMenuOpen(false)} />
        </div>
      ) : null}
    </>
  );
}

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
    <ThemeProvider>
      <Router>
        <UserContext.Provider value={user}>
          <AppRouterContent signInUser={signInUser} signOutUser={signOutUser} user={user} />
        </UserContext.Provider>
      </Router>
    </ThemeProvider>
  );
}
