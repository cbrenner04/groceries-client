const setUserInfo = (request) => {
  const { uid } = JSON.parse(sessionStorage.getItem('user'));
  sessionStorage.setItem('user', JSON.stringify({
    'access-token': request.getResponseHeader('access-token'),
    client: request.getResponseHeader('client'),
    uid,
  }));
}

module.exports = { setUserInfo };
