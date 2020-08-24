import { shape, number, bool, string } from 'prop-types';

const listItem = shape({
  id: string.isRequired,
  product: string,
  task: string,
  content: string,
  quantity: string,
  author: string,
  title: string,
  artist: string,
  album: string,
  assignee_id: string,
  due_by: string,
  read: bool,
  number_in_series: number,
  category: string,
  completed: bool,
  purchased: bool,
});

export default listItem;
