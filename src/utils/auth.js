const setUserInfo = (request) => {
  const accessToken = request.getResponseHeader('access-token');
  if (!accessToken) return;
  const client = request.getResponseHeader('client');
  const { uid } = JSON.parse(sessionStorage.getItem('user'));
  sessionStorage.setItem('user', JSON.stringify({
    'access-token': accessToken,
    client,
    uid,
  }));
}

const newSetUserInfo = (headers) => {
  const accessToken = headers['access-token'];
  if (!accessToken) return;
  const { client } = headers;
  const { uid } = JSON.parse(sessionStorage.getItem('user'));
  sessionStorage.setItem('user', JSON.stringify({
    'access-token': accessToken,
    client,
    uid,
  }));
}

module.exports = { setUserInfo, newSetUserInfo };
