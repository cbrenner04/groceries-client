import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import TemplatesList, { type ITemplatesListProps } from './TemplatesList';

interface ISetupReturn extends RenderResult {
  props: ITemplatesListProps;
}

function setup(suppliedProps?: Partial<ITemplatesListProps>): ISetupReturn {
  const defaultProps: ITemplatesListProps = {
    templates: [
      {
        id: 'id1',
        name: 'grocery list',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
      {
        id: 'id2',
        name: 'book list',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
    ],
    handleDelete: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <TemplatesList {...props} />
    </MemoryRouter>,
  );

  return { ...component, props };
}

describe('TemplatesList', () => {
  it('renders list of templates', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('displays each template', () => {
    const { getByTestId } = setup();

    expect(getByTestId('template-id1')).toBeVisible();
    expect(getByTestId('template-id2')).toBeVisible();
  });

  it('renders empty message when no templates', () => {
    const { getByText } = setup({ templates: [] });

    expect(getByText('No templates found')).toBeVisible();
  });

  it('renders single template when only one exists', () => {
    const { container, getByTestId } = setup({
      templates: [
        {
          id: 'id1',
          name: 'grocery list',
          user_id: 'id1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
      ],
    });

    expect(getByTestId('template-id1')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
