import { setUserInfo } from './auth';

describe('auth', () => {
  describe('setUserInfo', () => {
    it('does not set sessionStorage with user info when access token not provided', () => {
      const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');
      setUserInfo({ client: 'foo', uid: 'bar' });
      expect(spy).not.toHaveBeenCalled();
    });

    it('sets sessionStorage with user info', () => {
      const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');
      setUserInfo({ 'access-token': 'bar', client: 'foo', uid: 'bar' });
      expect(spy).toHaveBeenCalledWith('user', JSON.stringify({ 'access-token': 'bar', client: 'foo', uid: 'bar' }));
    });
  });
});
