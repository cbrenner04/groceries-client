const listIconClass = listType => (
  {
    BookList: 'fa-book',
    GroceryList: 'fa-shopping-bag',
    MusicList: 'fa-music',
    ToDoList: 'fa-list',
  }[listType]
);
export default listIconClass;
