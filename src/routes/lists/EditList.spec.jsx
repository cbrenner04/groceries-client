import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EditList from './EditList';
import axios from '../../utils/api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    id: '1',
  }),
}));

describe('EditList', () => {
  const renderEditList = (newProps) => {
    return render(
      <MemoryRouter>
        <EditList {...newProps} />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderEditList();
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderEditList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays EditList', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: { owner_id: 'id1', id: 'id1', name: 'foo', completed: false, type: 'GroceryList' },
    });
    const { container, getByText } = renderEditList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('Update List')).toBeVisible();
  });
});
