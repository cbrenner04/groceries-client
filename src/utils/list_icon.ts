import type { EListType } from '../typings';

const listIconClass = (listType: EListType): string =>
  ({
    BookList: 'fa-book',
    GroceryList: 'fa-shopping-bag',
    MusicList: 'fa-music',
    SimpleList: 'fa-file',
    ToDoList: 'fa-list',
  })[listType];

export default listIconClass;
