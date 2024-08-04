import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import SelectField, { type ISelectFieldProps } from './SelectField';

interface ISetupReturn extends RenderResult {
  formInput: HTMLElement;
  props: ISelectFieldProps;
  user: UserEvent;
}

async function setup(suppliedProps: Partial<ISelectFieldProps>): Promise<ISetupReturn> {
  const user = userEvent.setup();
  const defaultProps = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
    options: [
      {
        value: 'testOption1Value',
        label: 'testOption1Label',
      },
      {
        value: 'testOption2Value',
        label: 'testOption2Label',
      },
    ],
    blankOption: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<SelectField {...props} />);
  const formInput = await component.findByLabelText(props.label);

  return { formInput, ...component, props, user };
}

describe('SelectField', () => {
  describe('when blankOption is true', () => {
    describe('when value is not blank', () => {
      it('renders input with first option of empty string and clear input text', async () => {
        const { formInput, findByText, props } = await setup({ blankOption: true, value: 'testValue' });
        const formGroup = formInput.parentElement;

        expect(formGroup).toMatchSnapshot();
        expect(formInput).toHaveValue('');
        expect(await findByText(`Clear ${props.label}`)).toBeVisible();
      });
    });

    describe('when value is not blank', () => {
      it('renders input with first option of empty string and select input text', async () => {
        const { formInput, findByText, props } = await setup({ blankOption: true, value: '' });
        const formGroup = formInput.parentElement;

        expect(formGroup).toMatchSnapshot();
        expect(formInput).toHaveValue('');
        expect(await findByText(`Select ${props.label}`)).toBeVisible();
      });
    });
  });

  describe('when blankOption is false', () => {
    it('renders input with first option as first option provided', async () => {
      const { formInput, props } = await setup({ blankOption: false });
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveValue(props.options[0].value);
    });
  });

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup({ blankOption: true });
      await user.selectOptions(formInput, props.options[1].value);

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
