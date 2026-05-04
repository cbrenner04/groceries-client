import React, { type ChangeEvent } from 'react';
import { EListItemFieldType } from 'typings';
import Trash from 'components/ActionButtons/Trash';
import Checkbox from 'components/ui/Checkbox';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { fieldTypeLabel } from 'utils/format';
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

const dataTypeOptions = Object.values(EListItemFieldType).map((type) => ({
  value: type,
  label: fieldTypeLabel(type),
}));

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
      <div className="mb-2">
        <Input
          label="Label"
          type="text"
          value={props.row.label}
          onChange={handleLabelChange}
          testId={`field-row-label-${props.index}`}
          placeholder="e.g., product"
          error={hasLabelError ? 'Label cannot be blank' : undefined}
        />
      </div>

      <div className="mb-2">
        <Select
          label="Type"
          value={props.row.dataType}
          onChange={handleDataTypeChange}
          testId={`field-row-data-type-${props.index}`}
          options={dataTypeOptions}
        />
      </div>

      <div className="d-flex gap-2 align-items-center justify-content-between">
        <div className="mb-0" style={{ width: '80px' }}>
          <Input
            label="Position"
            type="number"
            value={String(props.row.position)}
            onChange={handlePositionChange}
            min={1}
            max={props.totalFields}
            testId={`field-row-position-${props.index}`}
            error={hasPositionError ? 'Duplicate position' : undefined}
          />
        </div>
        <div className="mb-0">
          <Checkbox
            checked={props.row.primary}
            onChange={handlePrimaryChange}
            label="Primary"
            testId={`field-row-primary-${props.index}`}
          />
        </div>
        <Trash handleClick={props.onRemove} testID={`field-row-remove-${props.index}`} disabled={!props.canRemove} />
      </div>
    </div>
  );
};

export default FieldConfigurationRow;
