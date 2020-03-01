import React from 'react';
import PropTypes from 'prop-types';

import ListItems from './ListItems';

const ListItemsContainer = props => (
  <div>
    <div className="clearfix">
      <h2 className="float-left">Items</h2>
      {!props.categories.length &&
        <button
          className="btn btn-light dropdown-toggle float-right"
          type="button"
          id="filter-by-category-button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          disabled
          style={{ cursor: 'not-allowed' }}
        >
          Filter by category
        </button>}
      {!!props.categories.length && !props.filter &&
        <div className="dropdown float-right">
          <button
            className="btn btn-light dropdown-toggle"
            type="button"
            id="filter-by-category-button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Filter by category
          </button>
          <div className="dropdown-menu" aria-labelledby="filter-by-category-button">
            {props.categories.sort().map((category) => {
              if (!category) return '';
              return (
                <button
                  key={category}
                  name={category}
                  onClick={props.handleCategoryFilter}
                  className="dropdown-item"
                  style={{ cursor: 'pointer' }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>}
      {props.filter &&
        <div className="float-right">
          <span style={{ lineHeight: '2.5rem', marginRight: '1rem' }}>Filtering by:</span>
          <button
            id="clear-filter-button"
            type="button"
            className="btn btn-outline-primary"
            style={{ marginRight: '1rem' }}
            onClick={props.handleClearFilter}
          >
            {props.filter} <i className="fa fa-trash" />
          </button>
        </div>}
    </div>
    {(props.filter || !props.categories.length) &&
      <div>
        <ListItems
          category={props.filter}
          items={props.notPurchasedItems[props.filter]}
          permission={props.permission}
          handleItemDelete={props.handleItemDelete}
          handlePurchaseOfItem={props.handlePurchaseOfItem}
          handleReadOfItem={props.handleReadOfItem}
          handleUnReadOfItem={props.handleUnReadOfItem}
          handleItemUnPurchase={props.handleItemUnPurchase}
          listType={props.listType}
          listUsers={props.listUsers}
        />
      </div>}
    {!props.filter && props.categories.sort().map(category => (
      <div key={category}>
        <ListItems
          category={category}
          items={props.notPurchasedItems[category]}
          permission={props.permission}
          handleItemDelete={props.handleItemDelete}
          handlePurchaseOfItem={props.handlePurchaseOfItem}
          handleReadOfItem={props.handleReadOfItem}
          handleUnReadOfItem={props.handleUnReadOfItem}
          handleItemUnPurchase={props.handleItemUnPurchase}
          listType={props.listType}
          listUsers={props.listUsers}
        />
        <br />
      </div>
    ))}
    <br />
    <h2>{props.listType === 'ToDoList' ? 'Completed' : 'Purchased'}</h2>
    <ListItems
      items={props.purchasedItems}
      purchased
      permission={props.permission}
      handleItemDelete={props.handleItemDelete}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleReadOfItem={props.handleReadOfItem}
      handleUnReadOfItem={props.handleUnReadOfItem}
      handleItemUnPurchase={props.handleItemUnPurchase}
      listType={props.listType}
      listUsers={props.listUsers}
    />
  </div>
);

ListItemsContainer.propTypes = {
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  handleCategoryFilter: PropTypes.func.isRequired,
  handleClearFilter: PropTypes.func.isRequired,
  filter: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  notPurchasedItems: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
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
    category: PropTypes.category,
  }).isRequired)).isRequired,
  purchasedItems: PropTypes.arrayOf(PropTypes.shape({
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
    category: PropTypes.category,
  }).isRequired).isRequired,
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
  })),
  permission: PropTypes.string.isRequired,
};

ListItemsContainer.defaultProps = {
  listUsers: [],
  filter: '',
  categories: [''],
};

export default ListItemsContainer;
