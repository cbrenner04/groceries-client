import React, { type ChangeEvent } from 'react';
import { EListItemFieldType } from 'typings';

import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Checkbox from 'components/ui/Checkbox';
import { IconButton } from 'components/ui/IconButton';
import { TrashIcon } from 'components/icons';
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

  const handleDataTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
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
    <div
      data-test-class="field-configuration-row"
      className={
        'tw:flex tw:flex-col tw:gap-3 tw:p-3 tw:rounded-lg tw:border ' +
        'tw:border-[var(--color-border)] tw:bg-[var(--color-surface-raised)]'
      }
    >
      <Input
        id={`field-row-label-${props.index}`}
        testId={`field-row-label-${props.index}`}
        label="Label"
        value={props.row.label}
        onChange={handleLabelChange}
        placeholder="e.g., product"
        error={hasLabelError ? 'Label cannot be blank' : undefined}
      />
      <Select
        id={`field-row-data-type-${props.index}`}
        testId={`field-row-data-type-${props.index}`}
        label="Type"
        value={props.row.dataType}
        onChange={handleDataTypeChange}
        options={dataTypeOptions}
      />
      <div className="tw:flex tw:items-end tw:gap-3 tw:justify-between">
        <div className="tw:w-24">
          <Input
            id={`field-row-position-${props.index}`}
            testId={`field-row-position-${props.index}`}
            label="Position"
            type="number"
            value={props.row.position}
            onChange={handlePositionChange}
            min={1}
            max={props.totalFields}
            error={hasPositionError ? 'Duplicate position' : undefined}
          />
        </div>
        <Checkbox
          id={`field-row-primary-${props.index}`}
          testId={`field-row-primary-${props.index}`}
          name={`field-row-primary-${props.index}`}
          label="Primary"
          checked={props.row.primary}
          onChange={handlePrimaryChange}
        />
        <IconButton
          icon={<TrashIcon size="sm" />}
          variant="danger"
          size="sm"
          label="Remove field"
          data-test-id={`field-row-remove-${props.index}`}
          onClick={props.onRemove}
          disabled={!props.canRemove}
        />
      </div>
    </div>
  );
};

export default FieldConfigurationRow;
