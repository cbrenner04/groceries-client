import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { EListItemFieldType } from 'typings';

import Input from 'components/ui/Input';
import FieldConfigurationRows, { type IFieldRow } from './FieldConfigurationRows';

export interface ITemplateFormProps {
  onFormSubmit: (name: string, fieldRows: IFieldRow[]) => Promise<void>;
  onPendingChange?: (pending: boolean) => void;
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
    props.onPendingChange?.(true);
    try {
      await props.onFormSubmit(name, fieldRows);
      setName('');
      setFieldRows(initialFieldRows());
      setShowValidation(false);
    } finally {
      props.onPendingChange?.(false);
    }
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
    </form>
  );
};

export default TemplateForm;
