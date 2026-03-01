import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import axios from 'utils/api';

import EditTemplate from './EditTemplate';
import * as utils from './utils';

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
    const { container, findByText } = renderEditTemplate();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when fetch fails', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = renderEditTemplate();

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when data is undefined', async () => {
    jest.spyOn(utils, 'fetchTemplateToEdit').mockResolvedValue(undefined);
    const { container, findByRole } = renderEditTemplate();

    await act(async () => {
      await waitFor(() => expect(utils.fetchTemplateToEdit).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders EditTemplateForm when data retrieval is complete', async () => {
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          id: 'id1',
          name: 'grocery list',
          user_id: 'id1',
          created_at: new Date('05/24/2020').toISOString(),
          updated_at: new Date('05/24/2020').toISOString(),
          archived_at: null,
        },
      })
      .mockResolvedValueOnce({
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
      });

    const { container, findByText } = renderEditTemplate();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    });

    expect(await findByText('Edit Template')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
