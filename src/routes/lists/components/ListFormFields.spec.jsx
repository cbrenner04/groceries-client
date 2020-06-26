import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ListFormFields from './ListFormFields';

describe('ListFormFields', () => {
  let props;

  beforeEach(() => {
    props = {
      name: 'foo',
      type: 'GroceryList',
      handleNameChange: jest.fn(),
      handleTypeChange: jest.fn(),
      handleCompletedChange: jest.fn(),
    };
  });

  it('renders new form', () => {
    const { container, getByLabelText, queryByLabelText } = render(<ListFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Type')).toBeVisible();
    expect(queryByLabelText('Completed')).toBeNull();
  });

  it('renders edit form', () => {
    props.editForm = true;
    const { container, getByLabelText } = render(<ListFormFields {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Type')).toBeVisible();
    expect(getByLabelText('Completed')).toBeVisible();
  });

  it('calls appropriate change handlers on change of inputs', () => {
    props.editForm = true;
    const { getByLabelText } = render(<ListFormFields {...props} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'a' } });

    expect(props.handleNameChange).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Type'), { target: { value: 'a' } });

    expect(props.handleTypeChange).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Completed'));

    expect(props.handleCompletedChange).toHaveBeenCalled();
  });
});
