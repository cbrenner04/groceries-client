import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';
import { EListItemFieldType } from 'typings';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import { PageLayout } from 'components/layout/PageLayout';
import { BottomSheet } from 'components/ui/BottomSheet';
import { BottomInputBar } from 'components/layout/BottomInputBar';
import TemplatesList from '../components/TemplatesList';
import EditTemplateForm from './EditTemplateForm';
import { failure, fetchTemplateToEdit } from '../utils';
import type { IFieldRow } from '../components/FieldConfigurationRows';

export interface ITemplatesContainerProps {
  templates: IListItemConfiguration[];
  initialEditTemplateId?: string | null;
}

interface IEditingTemplate {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
}

const TemplatesContainer: React.FC<ITemplatesContainerProps> = (props): React.JSX.Element => {
  const [templates, setTemplates] = useState(props.templates);
  const [, setPending] = useState(false);
  const [editing, setEditing] = useState<IEditingTemplate | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const navigate = useNavigate();

  const openEditSheet = useCallback(
    async (templateId: string): Promise<void> => {
      const result = await fetchTemplateToEdit({ id: templateId, navigate });
      if (result) {
        setEditing(result);
        setEditSheetOpen(true);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (props.initialEditTemplateId) {
      void openEditSheet(props.initialEditTemplateId);
    }
  }, [props.initialEditTemplateId, openEditSheet]);

  const handleCreateSubmit = async (name: string, fieldRows: IFieldRow[]): Promise<void> => {
    setPending(true);
    try {
      const { data: templateData } = await axios.post('/list_item_configurations', {
        list_item_configuration: { name },
      });

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

  const closeEditSheet = (): void => {
    setEditSheetOpen(false);
    setEditing(null);
  };

  const handleEditSaved = (): void => {
    closeEditSheet();
    // Refresh templates so the card reflects renamed templates immediately.
    void axios
      .get('/list_item_configurations')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTemplates(response.data.filter((t: IListItemConfiguration) => !t.archived_at));
        }
      })
      .catch(() => {
        // noop — keep current state
      });
  };

  return (
    <PageLayout
      title="Templates"
      bottomBar={
        <BottomInputBar
          placeholder="Create a new template..."
          hidden={editSheetOpen}
          onSubmit={(name: string): void => {
            void handleCreateSubmit(name, [
              { key: '0', label: 'Item', dataType: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
            ]);
          }}
        />
      }
    >
      <TemplatesList
        templates={templates}
        handleDelete={(templateId: string): void => {
          void handleDelete(templateId);
        }}
        onEdit={(templateId: string): void => {
          void openEditSheet(templateId);
        }}
      />

      <BottomSheet
        isOpen={editSheetOpen && editing !== null}
        onClose={closeEditSheet}
        title="Edit Template"
        testId="edit-template-sheet"
      >
        {editing && (
          <EditTemplateForm
            template={editing.template}
            fieldConfigurations={editing.fieldConfigurations}
            onCancel={closeEditSheet}
            onSaved={handleEditSaved}
          />
        )}
      </BottomSheet>
    </PageLayout>
  );
};

export default TemplatesContainer;
