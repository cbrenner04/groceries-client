import React from 'react';
import { render } from '@testing-library/react';

import FormSubmission from './FormSubmission';

describe('FormSubmission', () => {
  it('renders the spinner', () => {
    const formSubmission = render(
      <FormSubmission submitText="foo" displayCancelButton={true} cancelAction={jest.fn()} cancelText="bar" />,
    );

    expect(formSubmission).toMatchSnapshot();
    expect(formSubmission.getAllByRole('button')[0]).toHaveTextContent('foo');
    expect(formSubmission.getAllByRole('button')[1]).toHaveTextContent('bar');
  });
});
