import React from 'react';
import { act, render } from '@testing-library/react';
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

function setup() {
  const component = render(
    <MemoryRouter>
      <EditList />
    </MemoryRouter>,
  );

  return { ...component };
}

describe('EditList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = setup();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = setup();

    await act(async () => {
      jest.runAllTicks();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays EditList', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: { owner_id: 'id1', id: 'id1', name: 'foo', completed: false, type: 'GroceryList' },
    });
    const { container, findByText } = setup();

    await act(async () => {
      jest.runAllTicks();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();
    expect(await findByText('Update List')).toBeVisible();
  });
});
