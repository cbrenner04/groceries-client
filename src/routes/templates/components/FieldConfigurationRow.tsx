import React, { type ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';
import { EListItemFieldType } from 'typings';
import Trash from 'components/ActionButtons/Trash';
import type { IFieldRow } from './FieldConfigurationRows';

export interface IFieldConfigurationRowProps {
  index: number;
  row: IFieldRow;
  onRemove: () => void;
  onChange: (field: keyof IFieldRow, value: string | number | boolean) => void;
  canRemove: boolean;
  totalFields: number;
  showValidation?: boolean;
  hasDuplicatePosition?: boolean;
}

const dataTypeOptions = [
  { value: EListItemFieldType.FREE_TEXT, label: 'Free Text' },
  { value: EListItemFieldType.BOOLEAN, label: 'True/False' },
  { value: EListItemFieldType.DATE_TIME, label: 'Date/Time' },
  { value: EListItemFieldType.NUMBER, label: 'Number' },
];

const FieldConfigurationRow: React.FC<IFieldConfigurationRowProps> = (props): React.JSX.Element => {
  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.onChange('label', event.target.value);
  };

  const handleDataTypeChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    props.onChange('dataType', event.target.value as EListItemFieldType);
  };

  const handlePositionChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= props.totalFields) {
      props.onChange('position', value);
    }
  };

  const handlePrimaryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.onChange('primary', event.target.checked);
  };

  const hasLabelError = props.showValidation && props.row.label.trim() === '';
  const hasPositionError = props.showValidation && props.hasDuplicatePosition;

  return (
    <div className="mb-3 p-2 border rounded" data-test-class={`field-configuration-row`}>
      <Form.Group className="mb-2">
        <Form.Label className="small mb-1">Label</Form.Label>
        <Form.Control
          type="text"
          value={props.row.label}
          onChange={handleLabelChange}
          data-test-id={`field-row-label-${props.index}`}
          placeholder="e.g., product"
          isInvalid={hasLabelError}
        />
        {hasLabelError && (
          <Form.Control.Feedback type="invalid">Label cannot be blank</Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label className="small mb-1">Type</Form.Label>
        <Form.Control
          as="select"
          value={props.row.dataType}
          onChange={handleDataTypeChange}
          data-test-id={`field-row-data-type-${props.index}`}
        >
          {dataTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <div className="d-flex gap-2 align-items-center justify-content-between">
        <Form.Group className="mb-0" style={{ width: '80px' }}>
          <Form.Label className="small mb-1">Position</Form.Label>
          <Form.Control
            type="number"
            value={props.row.position}
            onChange={handlePositionChange}
            min={1}
            max={props.totalFields}
            data-test-id={`field-row-position-${props.index}`}
            isInvalid={hasPositionError}
          />
          {hasPositionError && (
            <Form.Control.Feedback type="invalid">Duplicate position</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-0">
          <Form.Check
            type="checkbox"
            checked={props.row.primary}
            onChange={handlePrimaryChange}
            label="Primary"
            data-test-id={`field-row-primary-${props.index}`}
          />
        </Form.Group>

        <Trash handleClick={props.onRemove} testID={`field-row-remove-${props.index}`} disabled={!props.canRemove} />
      </div>
    </div>
  );
};

export default FieldConfigurationRow;
