import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import EditList from './EditList';
import axios from '../../utils/api';

describe('EditList', () => {
  const props = {
    match: {
      params: {
        id: 'id1',
      },
    },
  };
  const renderEditList = (newProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <EditList {...newProps} history={history} />
      </Router>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderEditList(props);
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderEditList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays EditList', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: { owner_id: 'id1', id: 'id1', name: 'foo', completed: false, type: 'GroceryList' },
    });
    const { container, getByText } = renderEditList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('Update List')).toBeVisible();
  });
});
