import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CompleteListButtons from './CompleteListButtons';

describe('CompleteListButtons', () => {
  let props;

  beforeEach(() => {
    props = {
      onListRefresh: jest.fn(),
      onListDeletion: jest.fn(),
      userId: 1,
      list: {
        owner_id: 1,
      },
    };
  });
  it('renders buttons disabled with userId !== list.owner_id', () => {
    props.userId = 2;
    props.list.owner_id = 1;
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeDisabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 0.3 });
    expect(getByTestId('complete-list-trash')).toBeDisabled();
    expect(getByTestId('complete-list-trash')).toHaveStyle({ opacity: 0.3 });
  });

  it('renders buttons enabled with userId === list.owner_id', () => {
    props.userId = 1;
    props.list.owner_id = 1;
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeEnabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 1 });
    expect(getByTestId('complete-list-trash')).toBeEnabled();
    expect(getByTestId('complete-list-trash')).toHaveStyle({ opacity: 1 });
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
});
