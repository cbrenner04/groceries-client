import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { EListItemFieldType } from 'typings';

import Input from 'components/ui/Input';
import { Button } from 'components/ui/Button';
import FieldConfigurationRows, { type IFieldRow } from './FieldConfigurationRows';

export interface ITemplateFormProps {
  onFormSubmit: (name: string, fieldRows: IFieldRow[]) => Promise<void>;
  pending: boolean;
  onCancel: () => void;
}

const initialFieldRows = (): IFieldRow[] => [
  {
    key: '0',
    label: '',
    dataType: EListItemFieldType.FREE_TEXT,
    position: 1,
    primary: true,
  },
];

const TemplateForm: React.FC<ITemplateFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState('');
  const [fieldRows, setFieldRows] = useState<IFieldRow[]>(initialFieldRows());
  const [showValidation, setShowValidation] = useState(false);

  const isFormValid = (): boolean => {
    if (name.trim() === '') {
      return false;
    }
    if (fieldRows.some((row) => row.label.trim() === '')) {
      return false;
    }
    const positions = fieldRows.map((row) => row.position);
    if (positions.length !== new Set(positions).size) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setShowValidation(true);
    if (!isFormValid()) {
      return;
    }
    await props.onFormSubmit(name, fieldRows);
    setName('');
    setFieldRows(initialFieldRows());
    setShowValidation(false);
  };

  return (
    <form id="template-form" onSubmit={handleSubmit} autoComplete="off" className="tw:flex tw:flex-col tw:gap-4">
      <Input
        id="template-form-name"
        testId="template-form-name"
        name="template-form-name"
        label="Name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
        error={showValidation && name.trim() === '' ? 'Name cannot be blank' : undefined}
      />
      <FieldConfigurationRows fieldRows={fieldRows} setFieldRows={setFieldRows} showValidation={showValidation} />
      <div className="tw:flex tw:flex-col sm:tw:flex-row sm:tw:justify-end tw:gap-2">
        <Button variant="ghost" type="button" onClick={props.onCancel} fullWidth className="sm:tw:w-auto">
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={props.pending || !isFormValid()}
          fullWidth
          className="sm:tw:w-auto"
        >
          Create Template
        </Button>
      </div>
    </form>
  );
};

export default TemplateForm;
