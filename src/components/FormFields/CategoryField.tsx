import React, { type ChangeEventHandler, type ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface ICategoryFieldProps {
  handleInput: ChangeEventHandler;
  category?: string;
  categories?: string[];
  name?: string;
  child?: ReactNode;
  disabled?: boolean;
}

const CategoryField: React.FC<ICategoryFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name ?? 'category'} className="mb-3">
    <Form.Label>Category</Form.Label>
    <Form.Control
      type="text"
      value={props.category ?? ''}
      onChange={props.handleInput}
      list="categories"
      name={props.name ?? 'category'}
      disabled={props.disabled ?? false}
    />
    <datalist id="categories" data-test-id="categories">
      {(props.categories ?? []).map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
    {props.child ?? ''}
  </Form.Group>
);

export default CategoryField;
