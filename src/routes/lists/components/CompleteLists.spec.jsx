import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import CompleteLists from './CompleteLists';

describe('CompleteLists', () => {
  let props;

  const renderCompleteLists = (p) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <CompleteLists {...p} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      userId: 1,
      completedLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          owner_id: 1,
          created_at: new Date('05/27/2020').toISOString(),
          completed: true,
          users_list_id: 1,
          refreshed: false,
        },
      ],
      setCompletedLists: jest.fn(),
      currentUserPermissions: {},
      setCurrentUserPermissions: jest.fn(),
    };
  });

  it('renders link to full list in blurb when fullList is false', async () => {
    props.fullList = false;
    const { container, getAllByRole, getByTestId } = renderCompleteLists(props);

    fireEvent.click(getByTestId('Completed-popover'));
    await waitFor(() => getByTestId('popover-content'));

    expect(container).toMatchSnapshot();
    const allLinks = getAllByRole('link');
    expect(allLinks[allLinks.length - 1]).toHaveTextContent('See all completed lists here');
  });

  it('does not render link to full list when fullList is true', async () => {
    props.fullList = true;
    const { container, getAllByRole, getByTestId } = renderCompleteLists(props);

    fireEvent.click(getByTestId('Completed-popover'));
    await waitFor(() => getByTestId('popover-content'));

    expect(container).toMatchSnapshot();
    const allLinks = getAllByRole('link');
    expect(allLinks[allLinks.length - 1]).not.toHaveTextContent('See all completed lists here');
  });
});
