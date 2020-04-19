const setUserInfo = (headers) => {
  const accessToken = headers['access-token'];
  if (!accessToken) return;
  const { client, uid } = headers;
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
