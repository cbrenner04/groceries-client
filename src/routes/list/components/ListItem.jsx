import React from 'react';
import PropTypes from 'prop-types';

import { prettyDueBy } from '../../../utils/format';
import PurchasedItemButtons from './PurchasedItemButtons';
import NotPurchasedItemButtons from './NotPurchasedItemButtons';

function ListItem(props) {
  const itemName = {
    BookList: `${props.item.title ? `"${props.item.title}"` : ''} ${props.item.author}`,
    GroceryList: `${props.item.quantity} ${props.item.product}`,
    MusicList: `${props.item.title ? `"${props.item.title}"` : ''} ${props.item.artist} ` +
                `${props.item.artist && props.item.album ? '- ' : ''}` +
                `${props.item.album ? props.item.album : ''}`,
    ToDoList: `${props.item.task}`,
  }[props.listType];

  const itemButtons =
    props.purchased
      ? (<PurchasedItemButtons
        listType={props.listType}
        item={props.item}
        handleItemUnPurchase={props.handleItemUnPurchase}
        handleItemDelete={props.handleItemDelete}
        handleReadOfItem={props.handleReadOfItem}
        handleUnReadOfItem={props.handleUnReadOfItem}
      />) : (<NotPurchasedItemButtons
        listType={props.listType}
        item={props.item}
        handlePurchaseOfItem={props.handlePurchaseOfItem}
        handleItemDelete={props.handleItemDelete}
        handleReadOfItem={props.handleReadOfItem}
        handleUnReadOfItem={props.handleUnReadOfItem}
      />);

  return (
    <div
      className="list-group-item"
      key={props.item.id}
      style={{ display: 'block' }}
      data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
    >
      <div className="pt-1">{ itemName }</div>
      <div className="pt-1">
        {
          props.listType === 'ToDoList' &&
            <small className="text-muted">
              <div>
                {
                  props.item.assignee_id
                    ? `Assigned To: ${props.listUsers.find(user => user.id === props.item.assignee_id).email}`
                    : ''
                }
              </div>
              <div>{props.item.due_by ? `Due By: ${prettyDueBy(props.item.due_by)}` : ''}</div>
            </small>
        }
      </div>
      { props.permission === 'write' && itemButtons }
    </div>
  );
}

ListItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    product: PropTypes.string,
    task: PropTypes.string,
    quantity: PropTypes.string,
    author: PropTypes.string,
    title: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    assignee_id: PropTypes.number,
    due_by: PropTypes.string,
    read: PropTypes.bool,
    number_in_series: PropTypes.number,
    category: PropTypes.string,
  }).isRequired,
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

ListItem.defaultProps = {
  listUsers: [],
  purchased: false,
};

export default ListItem;
