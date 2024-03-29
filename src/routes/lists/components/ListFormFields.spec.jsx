import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ListFormFields from './ListFormFields';

function setup(suppliedProps) {
  const user = userEvent.setup();
  const defaultProps = {
    name: 'foo',
    type: 'GroceryList',
    handleNameChange: jest.fn(),
    handleTypeChange: jest.fn(),
    handleCompletedChange: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListFormFields {...props} />);

  return { ...component, props, user };
}

describe('ListFormFields', () => {
  it('renders new form', async () => {
    const { container, findByLabelText, queryByLabelText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Name')).toBeVisible();
    expect(await findByLabelText('Type')).toBeVisible();
    expect(queryByLabelText('Completed')).toBeNull();
  });

  it('renders edit form', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Name')).toBeVisible();
    expect(await findByLabelText('Type')).toBeVisible();
    expect(await findByLabelText('Completed')).toBeVisible();
  });

  it('calls appropriate change handlers on change of inputs', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Name'), 'a');

    expect(props.handleNameChange).toHaveBeenCalled();

    await user.selectOptions(await findByLabelText('Type'), 'MusicList');

    expect(props.handleTypeChange).toHaveBeenCalled();

    await user.click(await findByLabelText('Completed'));

    expect(props.handleCompletedChange).toHaveBeenCalled();
  });
});
