interface IUserInfo {
  'access-token'?: string;
  client: string;
  uid: string;
}

const setUserInfo = (headers: IUserInfo) => {
  const accessToken = headers['access-token'];
  if (!accessToken) {
    return;
  }
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

export { setUserInfo, IUserInfo };
