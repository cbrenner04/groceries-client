import React, { useContext } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { UserContext, UserContextProvider } from './UserContext';

describe('UserContext', () => {
  function FakeComponent() {
    const { user, signInUser, signOutUser } = useContext(UserContext);
    const handleSignIn = () => {
      signInUser('fakeToken', 'fakeClient', 'fakeUid');
    };
    const handleSignOut = () => signOutUser();

    return (
      <>
        <button onClick={handleSignIn}>foo</button>
        <button onClick={handleSignOut}>bar</button>
        <div>User: {JSON.stringify(user)}</div>
      </>
    );
  }
  const renderUserContext = () => {
    return render(
      <UserContextProvider>
        <FakeComponent />
      </UserContextProvider>,
    );
  };

  it('signs in and out', () => {
    const { getAllByRole, getByText } = renderUserContext();

    expect(getByText('User: null')).toBeVisible();
    expect(sessionStorage.getItem('user')).toEqual(null);

    fireEvent.click(getAllByRole('button')[0]);

    expect(getByText('User: {"accessToken":"fakeToken","client":"fakeClient","uid":"fakeUid"}')).toBeVisible();
    expect(sessionStorage.getItem('user')).toEqual(
      JSON.stringify({ 'access-token': 'fakeToken', client: 'fakeClient', uid: 'fakeUid' }),
    );

    fireEvent.click(getAllByRole('button')[1]);

    expect(getByText('User: null')).toBeVisible();
    expect(sessionStorage.getItem('user')).toEqual(null);
  });
});
