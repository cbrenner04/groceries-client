import React, { MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IFormSubmissionProps {
  disabled?: boolean;
  submitText: string;
  displayCancelButton: boolean;
  cancelAction: MouseEventHandler;
  cancelText?: string;
}

// TODO: check react-bootstrap has some way of handling the grid
const FormSubmission: React.FC<IFormSubmissionProps> = ({
  disabled = false,
  submitText,
  displayCancelButton,
  cancelAction,
  cancelText = '',
}) => (
  <div className="d-grid gap-2 mt-3">
    <Button type="submit" variant="success" disabled={disabled}>
      {submitText}
    </Button>
    {displayCancelButton && (
      <Button variant="link" onClick={cancelAction}>
        {cancelText}
      </Button>
    )}
  </div>
);

export default FormSubmission;
