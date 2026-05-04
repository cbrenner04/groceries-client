import React, { useMemo, useState } from 'react';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import { Card } from 'components/ui/Card';
import { IconButton } from 'components/ui/IconButton';
import { ConfirmDialog } from 'components/domain/ConfirmDialog';
import { EditIcon, TrashIcon } from 'components/icons';

export interface ITemplateProps {
  template: IListItemConfiguration;
  fieldConfigurations?: IListItemFieldConfiguration[];
  handleDelete: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
}

const Template: React.FC<ITemplateProps> = (props): React.JSX.Element => {
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = (): void => {
    props.handleDelete(props.template.id);
    setShowModal(false);
  };

  const fieldsSummary = useMemo((): string => {
    if (!props.fieldConfigurations) {
      return '';
    }

    return props.fieldConfigurations
      .slice()
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
      .map((fieldConfig) => fieldConfig.label.trim())
      .filter((label) => label.length > 0)
      .join(', ');
  }, [props.fieldConfigurations]);

  const handleEditClick = (): void => {
    if (props.onEdit) {
      props.onEdit(props.template.id);
    }
  };

  return (
    <React.Fragment>
      <Card
        data-test-class="template"
        data-test-id={`template-${props.template.id}`}
        className="tw:flex tw:flex-col tw:gap-1"
      >
        <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
          <h3 className="tw:text-base tw:font-semibold tw:m-0">{props.template.name}</h3>
          <div className="tw:flex tw:items-center tw:gap-1">
            {props.onEdit ? (
              <IconButton
                icon={<EditIcon size="sm" />}
                variant="primary"
                size="sm"
                label="Edit template"
                data-test-id="template-edit"
                onClick={handleEditClick}
              />
            ) : (
              <a
                href={`/templates/${props.template.id}/edit`}
                data-test-id="template-edit"
                className={
                  'tw:flex tw:items-center tw:justify-center tw:w-9 tw:h-9 tw:rounded-full ' +
                  'tw:text-[var(--color-primary)] tw:hover:bg-[var(--color-primary-light)]'
                }
                aria-label="Edit template"
              >
                <EditIcon size="sm" />
              </a>
            )}
            <IconButton
              icon={<TrashIcon size="sm" />}
              variant="danger"
              size="sm"
              label="Delete template"
              data-test-id="template-trash"
              onClick={(): void => setShowModal(true)}
            />
          </div>
        </div>
        {fieldsSummary ? (
          <p className="tw:text-xs tw:text-[var(--color-text-secondary)] tw:m-0">Fields: {fieldsSummary}</p>
        ) : null}
      </Card>
      <ConfirmDialog
        isOpen={showModal}
        title="delete"
        body="Are you sure you want to delete this template?"
        onConfirm={handleConfirmDelete}
        onClose={(): void => setShowModal(false)}
        confirmText="Yes, I'm sure."
      />
    </React.Fragment>
  );
};

export default Template;
