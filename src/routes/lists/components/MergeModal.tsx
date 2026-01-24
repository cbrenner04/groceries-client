import React, { type ChangeEventHandler, type MouseEventHandler } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';

import { TextField } from 'components/FormFields';
import type { IList } from 'typings';

export interface IMergeModalProps {
  showModal: boolean;
  clearModal: () => void;
  listNames: string;
  mergeName: string;
  handleMergeConfirm: MouseEventHandler;
  handleMergeNameChange: ChangeEventHandler;
  selectedLists?: IList[];
}

const MergeModal: React.FC<IMergeModalProps> = (props): React.JSX.Element => {
  const selectedLists = props.selectedLists ?? [];
  const configurationIds = [...new Set(selectedLists.map((list) => list.list_item_configuration_id))];
  const hasMultipleConfigurations = configurationIds.length > 1;
  const primaryConfigurationId = configurationIds[0];
  const listsOfPrimaryConfiguration = selectedLists.filter(
    (list) => list.list_item_configuration_id === primaryConfigurationId,
  );
  const excludedLists = selectedLists.filter((list) => list.list_item_configuration_id !== primaryConfigurationId);

  return (
    <Modal show={props.showModal} onHide={props.clearModal}>
      <Modal.Header closeButton>
        <Modal.Title>Merge {`"${props.listNames}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasMultipleConfigurations && (
          <Alert variant="warning" className="mb-3">
            <strong>Note:</strong> Only lists of the same type can be merged. Some lists will be excluded.
          </Alert>
        )}

        {hasMultipleConfigurations && excludedLists.length > 0 && (
          <Alert variant="info" className="mb-3">
            <strong>Lists to be merged ({listsOfPrimaryConfiguration.length}):</strong>
            <ul className="mb-0 mt-2">
              {listsOfPrimaryConfiguration.map((list) => (
                <li key={list.id}>{list.name}</li>
              ))}
            </ul>
            <strong className="mt-2 d-block">Lists excluded ({excludedLists.length}):</strong>
            <ul className="mb-0 mt-2">
              {excludedLists.map((list) => (
                <li key={list.id}>{list.name}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form>
          <TextField
            name="mergeName"
            label="Name for the merged list"
            value={props.mergeName}
            handleChange={props.handleMergeNameChange}
            placeholder="My super cool list"
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.clearModal} data-test-id={'clear-merge'}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={props.handleMergeConfirm}
          data-test-id={'confirm-merge'}
          disabled={!props.mergeName}
          className={props.mergeName ? 'merge-modal-confirm-enabled' : 'merge-modal-confirm-disabled'}
        >
          Merge lists
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MergeModal;
