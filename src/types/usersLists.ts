import { shape, string } from 'prop-types';

const usersLists = shape({
  user: shape({
    id: string,
    email: string,
  }),
  users_list: shape({
    id: string,
    permissions: string,
  }),
});

export default usersLists;
