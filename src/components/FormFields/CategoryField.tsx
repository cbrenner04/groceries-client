import React, { type ChangeEventHandler, type ReactNode } from 'react';
import Input from '../ui/Input';

export interface ICategoryFieldProps {
  handleInput: ChangeEventHandler;
  category?: string;
  categories?: string[];
  name?: string;
  child?: ReactNode;
  disabled?: boolean;
}

const CategoryField: React.FC<ICategoryFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3" data-test-id="category-field">
    <Input
      type="text"
      label="Category"
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
  </div>
);

export default CategoryField;
