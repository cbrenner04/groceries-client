import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import MergeModal, { type IMergeModalProps } from './MergeModal';

interface ISetupReturn extends RenderResult {
  props: IMergeModalProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IMergeModalProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    showModal: true,
    clearModal: jest.fn(),
    listNames: 'name", "name',
    mergeName: '',
    handleMergeConfirm: jest.fn(),
    handleMergeNameChange: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<MergeModal {...props} />);

  return { ...component, props, user };
}

describe('MergeModal', () => {
  it('does not render modal when showModal is false', () => {
    const { container, queryByTestId } = setup({ showModal: false });

    expect(container).toMatchInlineSnapshot('<div />');
    expect(queryByTestId('confirm-merge')).toBeNull();
  });

  it('renders', async () => {
    const { container, findByTestId, findByText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByText('Merge "name", "name"')).toBeVisible();
    expect(await findByTestId('confirm-merge')).toBeDisabled();
  });

  it('calls handleMergeNameChange when input value changes', async () => {
    const { findByLabelText, props, user } = setup();

    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });

  it('clears modal when x button is selected', async () => {
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('clears modal when Close is selected', async () => {
    const { findByTestId, props, user } = setup();

    await user.click(await findByTestId('clear-merge'));

    expect(props.clearModal).toHaveBeenCalled();
  });

  it('enables confirm when mergeName has a value', async () => {
    const { findByTestId } = setup({ mergeName: 'foo' });

    expect(await findByTestId('confirm-merge')).toBeEnabled();
  });

  it('call handleMergeConfirm when Merge lists is selected', async () => {
    const { findByLabelText, findByTestId, props, user } = setup();

    await user.type(await findByLabelText('Name for the merged list'), 'a');
    await user.click(await findByTestId('confirm-merge'));

    expect(props.handleMergeNameChange).toHaveBeenCalled();
  });
});
