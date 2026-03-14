import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';
import type { IListItemConfiguration } from 'typings';

import TemplateForm from '../components/TemplateForm';
import TemplatesList from '../components/TemplatesList';
import { failure } from '../utils';
import type { IFieldRow } from '../components/FieldConfigurationRows';

export interface ITemplatesContainerProps {
  templates: IListItemConfiguration[];
}

const TemplatesContainer: React.FC<ITemplatesContainerProps> = (props): React.JSX.Element => {
  const [templates, setTemplates] = useState(props.templates);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (name: string, fieldRows: IFieldRow[]): Promise<void> => {
    setPending(true);
    try {
      // Create template
      const { data: templateData } = await axios.post('/list_item_configurations', {
        list_item_configuration: { name },
      });

      // Create fields
      const fieldPromises = fieldRows.map((row) =>
        axios.post(`/list_item_configurations/${templateData.id}/list_item_field_configurations`, {
          list_item_field_configuration: {
            label: row.label,
            data_type: row.dataType,
            position: row.position,
            primary: row.primary,
          },
        }),
      );

      await Promise.all(fieldPromises);

      const updatedTemplates = update(templates, { $push: [templateData] });
      setTemplates(updatedTemplates);
      setPending(false);
      showToast.info('Template successfully created.');
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleDelete = async (templateId: string): Promise<void> => {
    try {
      setPending(true);
      await axios.delete(`/list_item_configurations/${templateId}`);
      const templateIndex = templates.findIndex((t) => t.id === templateId);
      if (templateIndex >= 0) {
        const updatedTemplates = update(templates, { $splice: [[templateIndex, 1]] });
        setTemplates(updatedTemplates);
      }
      showToast.info('Template successfully deleted.');
      setPending(false);
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  return (
    <React.Fragment>
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="mb-0" data-test-id="page-title">
          Templates
        </h1>
        <Link to="/lists" className="btn btn-link">
          Back to Lists
        </Link>
      </div>
      <TemplateForm onFormSubmit={handleFormSubmit} pending={pending} />
      <hr className="mb-4" />
      <TemplatesList templates={templates} handleDelete={handleDelete} />
    </React.Fragment>
  );
};

export default TemplatesContainer;
