const setUserInfo = headers => {
  const accessToken = headers['access-token'];
  if (!accessToken) return;
  const { client } = headers;
  const { uid } = JSON.parse(sessionStorage.getItem('user'));
  sessionStorage.setItem(
    'user',
    JSON.stringify({
      'access-token': accessToken,
      client,
      uid,
    }),
  );
};

module.exports = { setUserInfo };
