import React from 'react';
import { render } from '@testing-library/react';

import FormSubmission from './FormSubmission';

describe('FormSubmission', () => {
  it('renders the spinner', () => {
    const { container, getAllByRole } = render(
      <FormSubmission submitText="foo" displayCancelButton={true} cancelAction={jest.fn()} cancelText="bar" />,
    );

    expect(container).toMatchSnapshot();
    expect(getAllByRole('button')[0]).toHaveTextContent('foo');
    expect(getAllByRole('button')[1]).toHaveTextContent('bar');
  });
});
