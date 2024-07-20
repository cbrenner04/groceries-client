import { shape, string, bool } from 'prop-types';

const list = shape({
  id: string.isRequired,
  name: string.isRequired,
  type: string.isRequired,
  created_at: string.isRequired,
  completed: bool.isRequired,
  users_list_id: string,
  owner_id: string.isRequired,
  refreshed: bool.isRequired,
});

export default list;
