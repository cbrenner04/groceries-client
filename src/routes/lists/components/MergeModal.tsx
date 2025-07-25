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
  const listTypes = [...new Set(selectedLists.map((list) => list.type))];
  const hasMultipleTypes = listTypes.length > 1;
  const primaryType = listTypes[0];
  const listsOfPrimaryType = selectedLists.filter((list) => list.type === primaryType);
  const excludedLists = selectedLists.filter((list) => list.type !== primaryType);

  return (
    <Modal show={props.showModal} onHide={props.clearModal}>
      <Modal.Header closeButton>
        <Modal.Title>Merge {`"${props.listNames}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasMultipleTypes && (
          <Alert variant="warning" className="mb-3">
            <strong>Note:</strong> Only lists of the same type can be merged. Lists of type{' '}
            <strong>{primaryType}</strong> will be merged, while other types will be excluded.
          </Alert>
        )}

        {hasMultipleTypes && excludedLists.length > 0 && (
          <Alert variant="info" className="mb-3">
            <strong>Lists to be merged ({listsOfPrimaryType.length}):</strong>
            <ul className="mb-0 mt-2">
              {listsOfPrimaryType.map((list) => (
                <li key={list.id}>
                  {list.name} ({list.type})
                </li>
              ))}
            </ul>
            <strong className="mt-2 d-block">Lists excluded ({excludedLists.length}):</strong>
            <ul className="mb-0 mt-2">
              {excludedLists.map((list) => (
                <li key={list.id}>
                  {list.name} ({list.type})
                </li>
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
