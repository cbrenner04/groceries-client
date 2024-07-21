import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CategoryField from './CategoryField';

async function setup() {
  const user = userEvent.setup();
  const props = {
    handleInput: jest.fn(),
    category: 'testCategory',
    categories: ['testCategory1'],
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
    expect(formGroup?.children[2].firstChild).toHaveAttribute('value', props.categories[0]);
  });

  describe('when value changes', () => {
    it('calls handleInput', async () => {
      const { formInput, props, user } = await setup();
      await user.type(formInput, 'a');

      expect(props.handleInput).toHaveBeenCalled();
    });
  });
});
