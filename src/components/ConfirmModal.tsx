import React, { type ReactNode, type MouseEventHandler } from 'react';
import { Button, Modal } from 'react-bootstrap';

export interface IConfirmModalProps {
  action: string;
  body: string | ReactNode;
  show: boolean;
  handleConfirm: MouseEventHandler;
  handleClear: () => void;
}

const ConfirmModal: React.FC<IConfirmModalProps> = (props): React.JSX.Element => (
  <Modal show={props.show} onHide={props.handleClear}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm {props.action}</Modal.Title>
    </Modal.Header>
    <Modal.Body data-test-id="confirm-modal-body">{props.body}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={props.handleClear} data-test-id={`clear-${props.action}`}>
        Close
      </Button>
      <Button variant="primary" onClick={props.handleConfirm} data-test-id={`confirm-${props.action}`}>
        Yes, I&apos;m sure.
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
