import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import { PageLayout } from 'components/layout/PageLayout';
import { Button } from 'components/ui/Button';
import { BottomSheet } from 'components/ui/BottomSheet';
import TemplateForm from '../components/TemplateForm';
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
  const [pending, setPending] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editing, setEditing] = useState<IEditingTemplate | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editPending, setEditPending] = useState(false);
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
      setCreateSheetOpen(false);
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
      headerRight={
        <Button
          variant="primary"
          size="sm"
          onClick={(): void => setCreateSheetOpen(true)}
          data-test-id="add-template-button"
        >
          + Add
        </Button>
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
        isOpen={createSheetOpen}
        onClose={(): void => setCreateSheetOpen(false)}
        title="New Template"
        testId="add-template-sheet"
        footer={
          <div className="tw:flex tw:justify-end tw:gap-2">
            <Button variant="ghost" onClick={(): void => setCreateSheetOpen(false)} type="button" disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="template-form" disabled={pending} loading={pending}>
              Create Template
            </Button>
          </div>
        }
      >
        <TemplateForm onFormSubmit={handleCreateSubmit} onPendingChange={setPending} />
      </BottomSheet>

      <BottomSheet
        isOpen={editSheetOpen && editing !== null}
        onClose={closeEditSheet}
        title="Edit Template"
        testId="edit-template-sheet"
        footer={
          editing && (
            <div className="tw:flex tw:justify-end tw:gap-2">
              <Button variant="ghost" onClick={closeEditSheet} type="button" disabled={editPending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                form="edit-template-form"
                disabled={editPending}
                loading={editPending}
              >
                Update Template
              </Button>
            </div>
          )
        }
      >
        {editing && (
          <EditTemplateForm
            template={editing.template}
            fieldConfigurations={editing.fieldConfigurations}
            onCancel={closeEditSheet}
            onSaved={handleEditSaved}
            onPendingChange={setEditPending}
          />
        )}
      </BottomSheet>
    </PageLayout>
  );
};

export default TemplatesContainer;
