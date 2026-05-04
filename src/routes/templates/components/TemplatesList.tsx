import React from 'react';
import type { IListItemConfiguration } from 'typings';

import Template from './Template';

export interface ITemplatesListProps {
  templates: IListItemConfiguration[];
  handleDelete: (templateId: string) => void;
}

const TemplatesList: React.FC<ITemplatesListProps> = (props): React.JSX.Element => {
  if (props.templates.length === 0) {
    return <p>No templates found</p>;
  }

  return (
    <div
      className={
        'tw:border tw:border-[var(--color-border)] tw:rounded-lg ' + 'tw:divide-y tw:divide-[var(--color-border)]'
      }
    >
      {props.templates.map((template) => (
        <Template key={template.id} template={template} handleDelete={props.handleDelete} />
      ))}
    </div>
  );
};

export default TemplatesList;
