import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CompleteListButtons from './CompleteListButtons';

describe('CompleteListButtons', () => {
  let props;

  beforeEach(() => {
    props = {
      onListRefresh: jest.fn(),
      onListDeletion: jest.fn(),
      onListRemoval: jest.fn(),
      userId: 1,
      list: {
        owner_id: 1,
      },
    };
  });
  it('renders refresh disabled when user is not owner', () => {
    props.userId = 2;
    props.list.owner_id = 1;
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeDisabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 0.3 });
  });

  it('renders refresh enabled when user is owner', () => {
    props.userId = 1;
    props.list.owner_id = 1;
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeEnabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 1 });
  });

  it('calls props.onListRefresh when refresh button is clicked', () => {
    const { getByTestId } = render(<CompleteListButtons {...props} />);

    fireEvent.click(getByTestId('complete-list-refresh'));

    expect(props.onListRefresh).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete button is clicked', () => {
    const { getByTestId } = render(<CompleteListButtons {...props} />);

    fireEvent.click(getByTestId('complete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListRemoval when trash button is clicked and user is not owner', () => {
    props.list.owner_id = 2;

    const { getByTestId } = render(<CompleteListButtons {...props} />);

    fireEvent.click(getByTestId('complete-list-trash'));

    expect(props.onListRemoval).toHaveBeenCalledWith(props.list);
  });
});
