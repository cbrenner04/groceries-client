import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CategoryField, { type ICategoryFieldProps } from './CategoryField';

const categories = ['testCategory1'];

async function setup(): Promise<{
  formInput: HTMLElement;
  props: ICategoryFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const props = {
    handleInput: jest.fn(),
    category: 'testCategory',
    categories,
  };
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
    expect(formGroup?.children[2].firstChild).toHaveAttribute('value', categories[0]);
  });

  describe('when value changes', () => {
    it('calls handleInput', async () => {
      const { formInput, props, user } = await setup();
      await user.type(formInput, 'a');

      expect(props.handleInput).toHaveBeenCalled();
    });
  });
});
