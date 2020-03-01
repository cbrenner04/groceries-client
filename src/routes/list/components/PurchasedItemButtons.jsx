import React from 'react';
import PropTypes from 'prop-types';

function PurchasedItemButtons(props) {
  const handleRead = () => props.handleReadOfItem(props.item);
  const handleUnRead = () => props.handleUnReadOfItem(props.item);
  return (
    <div className="btn-group float-right" role="group">
      {
        (props.listType === 'GroceryList' || props.listType === 'ToDoList') &&
          <button onClick={() => props.handleItemUnPurchase(props.item)} className="btn btn-link p-0 mr-3">
            <i className="fa fa-refresh fa-2x text-primary" />
          </button>
      }
      {
        props.listType === 'BookList' &&
          <button onClick={props.item.read ? handleUnRead : handleRead} className="btn btn-link p-0 mr-3">
            <i className={`fa fa-bookmark${props.item.read ? '' : '-o'} fa-2x text-info`} />
          </button>
      }
      <button onClick={() => props.handleItemDelete(props.item)} className="btn btn-link p-0">
        <i className="fa fa-trash fa-2x text-danger" />
      </button>
    </div>
  );
}

PurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
  }).isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
};

export default PurchasedItemButtons;
