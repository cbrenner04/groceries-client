import React from 'react';
import { ListGroup } from 'react-bootstrap';
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
    <ListGroup>
      {props.templates.map((template) => (
        <Template key={template.id} template={template} handleDelete={props.handleDelete} />
      ))}
    </ListGroup>
  );
};

export default TemplatesList;
