import { EListType } from '../typings/ListTypeEnum';

const listIconClass = (listType: EListType) =>
  ({
    BookList: 'fa-book',
    GroceryList: 'fa-shopping-bag',
    MusicList: 'fa-music',
    SimpleList: 'fa-file',
    ToDoList: 'fa-list',
  })[listType];

export default listIconClass;
