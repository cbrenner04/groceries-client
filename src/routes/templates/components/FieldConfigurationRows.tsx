import React from 'react';
import { EListItemFieldType } from 'typings';

import { Button } from 'components/ui/Button';
import FieldConfigurationRow from './FieldConfigurationRow';

export interface IFieldRow {
  key: string;
  id?: string;
  label: string;
  dataType: EListItemFieldType;
  position: number;
  primary: boolean;
}

export interface IFieldConfigurationRowsProps {
  fieldRows: IFieldRow[];
  setFieldRows: (rows: IFieldRow[]) => void;
  showValidation?: boolean;
}

const FieldConfigurationRows: React.FC<IFieldConfigurationRowsProps> = (props): React.JSX.Element => {
  const handleAddField = (): void => {
    const newKey = String(Math.max(0, ...props.fieldRows.map((row) => parseInt(row.key, 10))) + 1);
    const newRow: IFieldRow = {
      key: newKey,
      label: '',
      dataType: EListItemFieldType.FREE_TEXT,
      position: props.fieldRows.length + 1,
      primary: false,
    };
    props.setFieldRows([...props.fieldRows, newRow]);
  };

  const handleRemoveField = (key: string): void => {
    const updatedRows = props.fieldRows.filter((row) => row.key !== key);
    props.setFieldRows(updatedRows);
  };

  const handleFieldChange = (key: string, field: keyof IFieldRow, value: string | number | boolean): void => {
    const updatedRows = props.fieldRows.map((row) => (row.key === key ? { ...row, [field]: value } : row));
    props.setFieldRows(updatedRows);
  };

  const hasDuplicatePosition = (position: number): boolean => {
    return props.fieldRows.filter((row) => row.position === position).length > 1;
  };

  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      <h4 className="tw:text-sm tw:font-semibold tw:m-0 tw:text-[var(--color-text-primary)]">Fields</h4>
      {props.fieldRows.map((row, index) => (
        <FieldConfigurationRow
          key={row.key}
          index={index}
          row={row}
          onRemove={(): void => handleRemoveField(row.key)}
          onChange={(field: keyof IFieldRow, value: string | number | boolean): void =>
            handleFieldChange(row.key, field, value)
          }
          canRemove={props.fieldRows.length > 1}
          totalFields={props.fieldRows.length}
          showValidation={props.showValidation}
          hasDuplicatePosition={hasDuplicatePosition(row.position)}
        />
      ))}
      <div>
        <Button variant="secondary" size="sm" type="button" onClick={handleAddField} data-test-id="add-field-button">
          Add Field
        </Button>
      </div>
    </div>
  );
};

export default FieldConfigurationRows;
