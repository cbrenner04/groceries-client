import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import axios from 'utils/api';

import EditTemplate from './EditTemplate';

describe('EditTemplate', () => {
  const renderEditTemplate = (): RenderResult =>
    render(
      <MemoryRouter initialEntries={['/templates/id1/edit']}>
        <Routes>
          <Route path="/templates/:id/edit" element={<EditTemplate />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders loading component when data is being fetched', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { findByText } = renderEditTemplate();

    expect(await findByText('Loading...')).toBeInTheDocument();
  });

  it('renders unknown error when fetch fails', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });
    const { findByRole } = renderEditTemplate();

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders unknown error when fetch returns no data', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: undefined });
    const { findByRole } = renderEditTemplate();

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders the templates page with edit sheet open when data retrieval is complete', async () => {
    axios.get = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/list_item_configurations') {
        return {
          data: [
            { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
          ],
        };
      }
      if (url === '/list_item_configurations/id1/edit') {
        return {
          data: { id: 'id1', name: 'grocery list', user_id: 'id1', created_at: '', updated_at: '', archived_at: null },
        };
      }
      if (url === '/list_item_configurations/id1/list_item_field_configurations') {
        return {
          data: [
            {
              id: 'field1',
              label: 'product',
              data_type: 'free_text',
              position: 1,
              primary: true,
              archived_at: null,
              list_item_configuration_id: 'id1',
              created_at: '',
              updated_at: '',
            },
          ],
        };
      }
      return { data: [] };
    });

    const { findByTestId } = renderEditTemplate();

    expect(await findByTestId('template-name')).toBeVisible();
    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/list_item_configurations/id1/edit'));
    });
  });
});
