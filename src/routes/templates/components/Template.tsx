import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import type { IListItemConfiguration } from 'typings';

import ConfirmModal from 'components/ConfirmModal';
import EditLink from 'components/ActionButtons/EditLink';
import Trash from 'components/ActionButtons/Trash';

export interface ITemplateProps {
  template: IListItemConfiguration;
  handleDelete: (templateId: string) => void;
}

const Template: React.FC<ITemplateProps> = (props): React.JSX.Element => {
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = (): void => {
    props.handleDelete(props.template.id);
    setShowModal(false);
  };

  return (
    <React.Fragment>
      <ListGroup.Item
        className="list-list-group-item"
        data-test-class="template"
        data-test-id={`template-${props.template.id}`}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{props.template.name}</h5>
          <div className="d-flex gap-2">
            <EditLink to={`/templates/${props.template.id}/edit`} testID="template-edit" />
            <Trash handleClick={(): void => setShowModal(true)} testID="template-trash" />
          </div>
        </div>
      </ListGroup.Item>
      <ConfirmModal
        action="delete"
        body="Are you sure you want to delete this template?"
        show={showModal}
        handleConfirm={handleConfirmDelete}
        handleClear={(): void => setShowModal(false)}
      />
    </React.Fragment>
  );
};

export default Template;
