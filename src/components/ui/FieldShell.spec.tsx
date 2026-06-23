import React from 'react';
import { render } from '@testing-library/react';
import FieldShell from './FieldShell';

describe('FieldShell', () => {
  it('renders the label notched on the box and linked to the control', () => {
    const { getByText } = render(
      <FieldShell label="Name" htmlFor="name-input">
        <input id="name-input" />
      </FieldShell>,
    );
    const label = getByText('Name');
    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe('name-input');
  });

  it('renders no label element when no label is provided', () => {
    const { container, queryByText } = render(
      <FieldShell htmlFor="x">
        <input id="x" />
      </FieldShell>,
    );
    expect(queryByText('Name')).toBeNull();
    expect(container.querySelector('label')).toBeNull();
  });

  it('renders an error message when error is provided', () => {
    const { getByText } = render(
      <FieldShell htmlFor="x" error="Required">
        <input id="x" />
      </FieldShell>,
    );
    expect(getByText('Required').tagName).toBe('P');
  });

  it('renders no error paragraph when error is absent', () => {
    const { container } = render(
      <FieldShell htmlFor="x">
        <input id="x" />
      </FieldShell>,
    );
    expect(container.querySelector('p')).toBeNull();
  });
});
