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

const CategoryField: React.FC<ICategoryFieldProps> = ({
  category = '',
  categories = [],
  handleInput,
  name = 'category',
  child = '',
  disabled = false,
}): React.JSX.Element => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>Category</Form.Label>
    <Form.Control
      type="text"
      value={category}
      onChange={handleInput}
      list="categories"
      name={name}
      disabled={disabled}
    />
    <datalist id="categories">
      {categories.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
    {child}
  </Form.Group>
);

export default CategoryField;
