import React from 'react';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import Template from './Template';

export interface ITemplatesListProps {
  templates: IListItemConfiguration[];
  fieldConfigurationsByTemplate?: Record<string, IListItemFieldConfiguration[]>;
  handleDelete: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
}

const TemplatesList: React.FC<ITemplatesListProps> = (props): React.JSX.Element => {
  if (props.templates.length === 0) {
    return <p className="tw:text-sm tw:text-[var(--color-text-secondary)]">No templates found</p>;
  }

  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      {props.templates.map((template) => (
        <Template
          key={template.id}
          template={template}
          fieldConfigurations={props.fieldConfigurationsByTemplate?.[template.id]}
          handleDelete={props.handleDelete}
          onEdit={props.onEdit}
        />
      ))}
    </div>
  );
};

export default TemplatesList;
