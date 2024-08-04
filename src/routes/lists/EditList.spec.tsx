import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EditList from './EditList';
import axios from '../../utils/api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => jest.fn(),
  useParams: (): { id: string } => ({ id: '1' }),
}));

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <EditList />
    </MemoryRouter>,
  );

describe('EditList', () => {
  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = setup();

    expect(await findByText('Loading...')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays EditList', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: { owner_id: 'id1', id: 'id1', name: 'foo', completed: false, type: 'GroceryList' },
    });
    const { container, findByText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByText('Update List')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
