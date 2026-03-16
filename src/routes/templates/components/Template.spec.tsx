import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Template, { type ITemplateProps } from './Template';

interface ISetupReturn extends RenderResult {
  props: ITemplateProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<ITemplateProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ITemplateProps = {
    template: {
      id: 'id1',
      name: 'grocery list',
      user_id: 'id1',
      created_at: '',
      updated_at: '',
      archived_at: null,
    },
    handleDelete: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <Template {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('Template', () => {
  it('renders template with name', () => {
    const { container, getByText } = setup();

    expect(getByText('grocery list')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders edit link', () => {
    const { getByTestId } = setup();

    const editLink = getByTestId('template-edit');
    expect(editLink).toHaveAttribute('href', '/templates/id1/edit');
  });

  it('renders delete button', () => {
    const { getByTestId } = setup();

    expect(getByTestId('template-trash')).toBeVisible();
  });

  it('shows confirm modal when delete button clicked', async () => {
    const { getByTestId, findByRole, user } = setup();

    await user.click(getByTestId('template-trash'));

    const modal = await findByRole('dialog');
    expect(modal).toBeVisible();
  });

  it('calls handleDelete when modal confirm is clicked', async () => {
    const { getByTestId, findByTestId, props, user } = setup();

    await user.click(getByTestId('template-trash'));
    const confirmButton = await findByTestId('confirm-delete');
    await user.click(confirmButton);

    expect(props.handleDelete).toHaveBeenCalledWith('id1');
  });

  it('closes modal when cancel button is clicked', async () => {
    const { getByTestId, findByTestId, queryByRole, user } = setup();

    await user.click(getByTestId('template-trash'));
    const cancelButton = await findByTestId('clear-delete');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders template with correct test id', () => {
    const { getByTestId } = setup({
      template: {
        id: 'custom-id',
        name: 'test template',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
    });

    expect(getByTestId('template-custom-id')).toBeVisible();
  });
});
