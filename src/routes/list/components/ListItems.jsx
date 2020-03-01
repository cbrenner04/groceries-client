import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { capitalize } from '../../../utils/format';
import ListItem from './ListItem';

function ListItems(props) {
  const [sortedItems, setSortedItems] = useState(props.items);

  const performSort = (items, sortAttrs) => {
    if (sortAttrs.length === 0) return items;
    const sortAttr = sortAttrs.pop();
    const sorted = items.sort((a, b) => {
      // the sort from the server comes back with items with number_in_series: `null` at the end of the list
      // without the next two lines this would put those items at the front of the list
      if (a[sortAttr] === null) return 1;
      if (b[sortAttr] === null) return -1;
      const positiveBranch = (a[sortAttr] > b[sortAttr]) ? 1 : 0;
      return (a[sortAttr] < b[sortAttr]) ? -1 : positiveBranch;
    });
    return performSort(sorted, sortAttrs);
  };

  const sortItems = (items) => {
    let sortAttrs = [];
    if (props.listType === 'BookList') {
      sortAttrs = ['author', 'number_in_series', 'title'];
    } else if (props.listType === 'GroceryList') {
      sortAttrs = ['product'];
    } else if (props.listType === 'MusicList') {
      sortAttrs = ['artist', 'album', 'title'];
    } else if (props.listType === 'ToDoList') {
      sortAttrs = ['due_by', 'assignee_id', 'task'];
    }
    const sorted = performSort(items, sortAttrs);
    return sorted;
  };

  useEffect(() => {
    const sorted = sortItems(props.items);
    setSortedItems(sorted);
  }, [props.items]);

  return (
    <div className="list-group">
      {props.category &&
        <h5 data-test-class="category-header">{capitalize(props.category)}</h5>}
      {
        sortedItems.map(item => (
          <ListItem
            item={item}
            key={item.id}
            purchased={props.purchased}
            handleItemDelete={props.handleItemDelete}
            handlePurchaseOfItem={props.handlePurchaseOfItem}
            handleReadOfItem={props.handleReadOfItem}
            handleUnReadOfItem={props.handleUnReadOfItem}
            handleItemUnPurchase={props.handleItemUnPurchase}
            listType={props.listType}
            listUsers={props.listUsers}
            permission={props.permission}
          />
        ))
      }
    </div>
  );
}

ListItems.propTypes = {
  category: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    product: PropTypes.string,
    task: PropTypes.string,
    quantity: PropTypes.string,
    author: PropTypes.string,
    title: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    assignee_id: PropTypes.number,
    due_by: PropTypes.date,
    read: PropTypes.bool,
    number_in_series: PropTypes.number,
    category: PropTypes.string,
  }).isRequired),
  purchased: PropTypes.bool,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
  })),
  permission: PropTypes.string.isRequired,
};

ListItems.defaultProps = {
  items: [],
  listUsers: [],
  purchased: false,
  category: '',
};

export default ListItems;
