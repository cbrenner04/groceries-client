import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import ListForm from './ListForm';

describe('ListForm', () => {
  it('renders', () => {
    const { container } = render(<ListForm pending={false} onFormSubmit={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });

  it('expands form', async () => {
    const { baseElement, getByText } = render(<ListForm pending={false} onFormSubmit={jest.fn()} />);

    fireEvent.click(getByText('Add List'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    expect(baseElement.children[0].children[0]).toHaveClass('show');
  });

  it('collapses form', async () => {
    const { baseElement, getByText } = render(<ListForm pending={false} onFormSubmit={jest.fn()} />);

    fireEvent.click(getByText('Add List'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    fireEvent.click(getByText('Collapse Form'));
    await waitFor(() => expect(baseElement.children[0].children[0]).not.toHaveClass('show'));

    expect(baseElement.children[0].children[0]).not.toHaveClass('show');
  });

  it('changes the value in the name field', () => {
    const { getByLabelText } = render(<ListForm pending={false} onFormSubmit={jest.fn()} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'foo' } });

    expect(getByLabelText('Name')).toHaveValue('foo');
  });

  it('changes the value in the type field', () => {
    const { getByLabelText } = render(<ListForm pending={false} onFormSubmit={jest.fn()} />);

    fireEvent.change(getByLabelText('Type'), { target: { value: 'MusicList' } });

    expect(getByLabelText('Type')).toHaveValue('MusicList');
  });

  it('calls props.onFormSubmit when form is submitted', async () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { getByLabelText, getAllByRole } = render(<ListForm pending={false} onFormSubmit={onFormSubmit} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getAllByRole('button')[1]);

    await waitFor(() => expect(onFormSubmit).toHaveBeenCalledTimes(1));

    expect(onFormSubmit).toHaveBeenCalledWith({ name: 'foo', type: 'BookList' });
  });

  it('disables submit when in pending state', () => {
    const onFormSubmit = jest.fn().mockResolvedValue({});
    const { getAllByRole } = render(<ListForm pending={true} onFormSubmit={onFormSubmit} />);

    expect(getAllByRole('button')[1]).toBeDisabled();
  });
});
