import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';
import { EListItemFieldType } from 'typings';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import { PageLayout } from 'components/layout/PageLayout';
import { useBottomInputBarFormContext } from 'components/layout/BottomInputBarFormContext';
import { BottomSheet } from 'components/ui/BottomSheet';
import { AddFormModal } from 'components/ui/AddFormModal';
import Input from 'components/ui/Input';
import { Button } from 'components/ui/Button';
import TemplatesList from '../components/TemplatesList';
import EditTemplateForm from './EditTemplateForm';
import { failure, fetchTemplateToEdit } from '../utils';
import FieldConfigurationRows, { type IFieldRow } from '../components/FieldConfigurationRows';

export interface ITemplatesContainerProps {
  templates: IListItemConfiguration[];
  initialEditTemplateId?: string | null;
}

interface IEditingTemplate {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
}

const initialFieldRows = (): IFieldRow[] => [
  { key: '0', label: '', dataType: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
];

const TemplatesContainer: React.FC<ITemplatesContainerProps> = (props): React.JSX.Element => {
  const [templates, setTemplates] = useState(props.templates);
  const [pending, setPending] = useState(false);
  const [createTemplateName, setCreateTemplateName] = useState('');
  const [createFieldRows, setCreateFieldRows] = useState<IFieldRow[]>(initialFieldRows());
  const [editing, setEditing] = useState<IEditingTemplate | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const { addFormModalOpen, setAddFormModalOpen } = useBottomInputBarFormContext();
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

  const handleCloseCreateModal = (): void => {
    setAddFormModalOpen(false);
    setCreateTemplateName('');
    setCreateFieldRows(initialFieldRows());
  };

  const handleCreateTemplate = async (): Promise<void> => {
    const trimmed = createTemplateName.trim();
    if (!trimmed || pending) {
      return;
    }
    setPending(true);
    try {
      const { data: templateData } = await axios.post('/list_item_configurations', {
        list_item_configuration: { name: trimmed },
      });

      const fieldPromises = createFieldRows.map((row) =>
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
      handleCloseCreateModal();
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
    <PageLayout title="Templates">
      <div className="tw:pb-[calc(3.5rem+var(--spacing-nav-height)+1rem)]">
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

        {!editSheetOpen ? (
          <button
            type="button"
            data-test-id="templates-create-fab"
            aria-label="Create template"
            onClick={(): void => setAddFormModalOpen(true)}
            className={
              'tw:fixed tw:bottom-[calc(var(--spacing-nav-height)+1rem+env(safe-area-inset-bottom))] tw:right-4 ' +
              'tw:z-[var(--z-sticky)] tw:flex tw:items-center tw:justify-center tw:w-14 tw:h-14 ' +
              'tw:rounded-full tw:bg-[var(--color-primary)] tw:text-white tw:text-2xl tw:leading-none ' +
              'tw:shadow-[var(--shadow-lg)] tw:border-0 tw:cursor-pointer'
            }
          >
            +
          </button>
        ) : null}

        <AddFormModal
          isOpen={addFormModalOpen}
          onClose={handleCloseCreateModal}
          title="Create template"
          testId="create-template-modal"
          footer={
            <>
              <Button variant="ghost" data-test-id="create-template-cancel" onClick={handleCloseCreateModal}>
                Cancel
              </Button>
              <Button
                data-test-id="create-template-submit"
                onClick={(): void => {
                  void handleCreateTemplate();
                }}
                disabled={pending || !createTemplateName.trim()}
                loading={pending}
              >
                Create
              </Button>
            </>
          }
        >
          <div className="tw:flex tw:flex-col tw:gap-4">
            <Input
              label="Name"
              value={createTemplateName}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setCreateTemplateName(e.target.value)}
              placeholder="Create a new template..."
              testId="create-template-name-input"
            />
            <FieldConfigurationRows fieldRows={createFieldRows} setFieldRows={setCreateFieldRows} />
          </div>
        </AddFormModal>
      </div>
    </PageLayout>
  );
};

export default TemplatesContainer;
