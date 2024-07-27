import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CategoryField, { type ICategoryFieldProps } from './CategoryField';

const categories = ['testCategory1'];

async function setup(suppliedProps?: Partial<ICategoryFieldProps>): Promise<{
  formInput: HTMLElement;
  props: ICategoryFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps = {
    handleInput: jest.fn(),
    category: 'testCategory',
    categories,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { findByLabelText } = render(<CategoryField {...props} />);
  const formInput = await findByLabelText('Category');

  return { formInput, props, user };
}

describe('CategoryField', () => {
  it('renders input with datalist', async () => {
    const { formInput, props } = await setup();
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(props.category);
    expect(formGroup?.children[2].firstChild).toHaveValue(categories[0]);
  });

  it('renders when no category or categories given', async () => {
    const { formInput } = await setup({ category: undefined, categories: undefined });
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue('');
    expect(formGroup?.children[2].firstChild).toBeNull();
  });

  describe('when value changes', () => {
    it('calls handleInput', async () => {
      const { formInput, props, user } = await setup();
      await user.type(formInput, 'a');

      expect(props.handleInput).toHaveBeenCalled();
    });
  });
});
