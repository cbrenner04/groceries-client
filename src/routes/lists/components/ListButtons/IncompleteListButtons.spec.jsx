import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import IncompleteListButtons from './IncompleteListButtons';

describe('IncompleteListButtons', () => {
  let props;
  const renderIncompleteListButtons = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <IncompleteListButtons {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      userId: 1,
      list: {
        id: 1,
        owner_id: 1,
      },
      onListCompletion: jest.fn(),
      onListDeletion: jest.fn(),
      currentUserPermissions: 'write',
      multiSelect: false,
      handleMerge: jest.fn(),
    };
  });

  it('complete and edit are disabled when user is not owner', () => {
    props.userId = 2;
    props.list.owner_id = 3;
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-complete')).toBeDisabled();
    expect(getByTestId('incomplete-list-complete')).toHaveStyle({ opacity: 0.3 });
    expect(getByTestId('incomplete-list-edit')).toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-edit')).toHaveStyle({ opacity: 0.3, pointerEvents: 'none' });
  });

  it('complete and edit are enabled when user is owner', () => {
    props.userId = 1;
    props.list.owner_id = 1;
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-complete')).toBeEnabled();
    expect(getByTestId('incomplete-list-complete')).toHaveStyle({ opacity: 1 });
    expect(getByTestId('incomplete-list-edit')).not.toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-edit')).toHaveStyle({ opacity: 1, pointerEvents: 'auto' });
  });

  it('share is disabled when user does not have write permissions', () => {
    props.currentUserPermissions = 'read';
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-share')).toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-share')).toHaveStyle({ opacity: 0.3, pointerEvents: 'none' });
  });

  it('share is disabled when multiSelect', () => {
    props.multiSelect = true;
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-share')).toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-share')).toHaveStyle({ opacity: 0.3, pointerEvents: 'none' });
  });

  it('share is enabled when user has write permissions and not multiSelect', () => {
    props.currentUserPermissions = 'write';
    props.multiSelect = false;
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-share')).not.toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-share')).toHaveStyle({ opacity: 1, pointerEvents: 'auto' });
  });

  it('calls props.onListCompletion when complete is clicked', () => {
    const { getByTestId } = renderIncompleteListButtons(props);

    fireEvent.click(getByTestId('incomplete-list-complete'));

    expect(props.onListCompletion).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete is clicked', () => {
    const { getByTestId } = renderIncompleteListButtons(props);

    fireEvent.click(getByTestId('incomplete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });
});
