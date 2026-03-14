import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';

import Templates from './Templates';
import * as utils from './utils';

describe('Templates', () => {
  const renderTemplates = (): RenderResult =>
    render(
      <MemoryRouter>
        <Templates />
      </MemoryRouter>,
    );

  it('renders loading component when data is being fetched', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container, findByText } = renderTemplates();

    expect(await findByText('Loading...')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = renderTemplates();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when data is undefined', async () => {
    vi.spyOn(utils, 'fetchTemplates').mockResolvedValue(undefined);
    const { container, findByRole } = renderTemplates();

    await act(async () => {
      await waitFor(() => expect(utils.fetchTemplates).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders TemplatesContainer when data retrieval is complete', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'id1',
          name: 'grocery list',
          user_id: 'id1',
          created_at: new Date('05/24/2020').toISOString(),
          updated_at: new Date('05/24/2020').toISOString(),
          archived_at: null,
        },
      ],
    });

    const { container, findByText } = renderTemplates();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(await findByText('Templates')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
