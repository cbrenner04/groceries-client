import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import MergeModal from './MergeModal';

describe('MergeModal', () => {
  let props;

  beforeEach(() => {
    props = {
      showModal: true,
      clearModal: jest.fn(),
      listNames: 'name", "name',
      mergeName: '',
      handleMergeConfirm: jest.fn(),
      handleMergeNameChange: jest.fn(),
    };
  });

  it('does not render modal when showModal is false', () => {
    props.showModal = false;
    const { container, queryByTestId } = render(<MergeModal {...props} />);

    expect(container).toMatchInlineSnapshot(`<div />`);
    expect(queryByTestId('confirm-merge')).toBeNull();
  });

  it('renders', () => {
    const { container, getByTestId, getByText } = render(<MergeModal {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByText('Merge "name", "name"')).toBeVisible();
    expect(getByTestId('confirm-merge')).toBeDisabled();
  });

  it('calls handleMergeNameChange when input value changes', () => {
    const { getByLabelText } = render(<MergeModal {...props} />);

    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });

  it('clears modal when x button is selected', () => {
    const { getAllByRole } = render(<MergeModal {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('clears modal when Close is selected', () => {
    const { getByTestId } = render(<MergeModal {...props} />);

    fireEvent.click(getByTestId('clear-merge'));

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('enables confirm when mergeName has a value', () => {
    props.mergeName = 'foo';
    const { getByTestId } = render(<MergeModal {...props} />);

    expect(getByTestId('confirm-merge')).toBeEnabled();
  });

  it('call handleMergeConfirm when Merge lists is selected', () => {
    const { getByLabelText, getByTestId } = render(<MergeModal {...props} />);

    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });
    fireEvent.click(getByTestId('confirm-merge'));

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });
});
