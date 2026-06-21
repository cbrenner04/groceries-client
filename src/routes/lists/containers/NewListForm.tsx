import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import type { IListItemConfiguration } from 'typings';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

export interface INewListFormProps {
  listItemConfigurations: IListItemConfiguration[];
  onSubmit: (name: string, templateId: string) => void;
  pending?: boolean;
}

const NewListForm: React.FC<INewListFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(props.listItemConfigurations[0]?.id ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    props.onSubmit(name, selectedTemplateId);
  };

  const templateOptions = props.listItemConfigurations.map((config) => ({
    value: config.id,
    label: config.name,
  }));

  return (
    <form id="new-list-form" onSubmit={handleSubmit} autoComplete="off" className="tw:flex tw:flex-col tw:gap-4">
      <Input
        id="name"
        name="name"
        label="Name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
        placeholder="My super cool list"
        testId="new-list-name-input"
        disabled={props.pending}
      />
      <Select
        label="Template"
        options={templateOptions}
        value={selectedTemplateId}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => setSelectedTemplateId(e.target.value)}
        id="new_list_item_configuration_id"
        testId="new-list-template-select"
        disabled={props.pending}
      />
    </form>
  );
};

export default NewListForm;
