import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import PendingListButtons from './PendingListButtons';

describe('PendingListButtons', () => {
  let props;

  beforeEach(() => {
    props = {
      list: {
        id: 1,
      },
      onListAcceptance: jest.fn(),
      onListRejection: jest.fn(),
    };
  });

  it('renders', () => {
    const { container } = render(<PendingListButtons {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('calls props.onListAcceptance when complete is clicked', () => {
    const { getByTestId } = render(<PendingListButtons {...props} />);

    fireEvent.click(getByTestId('pending-list-accept'));

    expect(props.onListAcceptance).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListRejection when trash is clicked', () => {
    const { getByTestId } = render(<PendingListButtons {...props} />);

    fireEvent.click(getByTestId('pending-list-trash'));

    expect(props.onListRejection).toHaveBeenCalledWith(props.list);
  });
});
