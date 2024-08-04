import React from 'react';
import { render } from '@testing-library/react';

import FormSubmission from './FormSubmission';

describe('FormSubmission', () => {
  it('renders the submit and cancel', () => {
    const { container, getAllByRole } = render(
      <FormSubmission submitText="foo" cancelAction={jest.fn()} cancelText="bar" />,
    );

    expect(container).toMatchSnapshot();
    expect(getAllByRole('button')[0]).toHaveTextContent('foo');
    expect(getAllByRole('button')[1]).toHaveTextContent('bar');
  });

  it('does not render cancel button when cancel text and cancel action are not provided', () => {
    const { container, getAllByRole, queryAllByRole } = render(<FormSubmission submitText="foo" />);

    expect(container).toMatchSnapshot();
    expect(getAllByRole('button')[0]).toHaveTextContent('foo');
    expect(queryAllByRole('button')[1]).toBeUndefined();
  });
});
