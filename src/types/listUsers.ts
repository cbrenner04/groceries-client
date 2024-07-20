import { shape, string } from 'prop-types';

const listUsers = shape({
  id: string.isRequired,
  email: string.isRequired,
});

export default listUsers;
