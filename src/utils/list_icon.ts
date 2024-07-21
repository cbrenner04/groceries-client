const listIconClass = (listType: 'BookList' | 'GroceryList' | 'MusicList' | 'SimpleList' | 'ToDoList') =>
  ({
    BookList: 'fa-book',
    GroceryList: 'fa-shopping-bag',
    MusicList: 'fa-music',
    SimpleList: 'fa-file',
    ToDoList: 'fa-list',
  })[listType];

export default listIconClass;
