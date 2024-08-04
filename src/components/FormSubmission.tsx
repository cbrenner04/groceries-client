import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IFormSubmissionProps {
  disabled?: boolean;
  submitText: string;
  cancelAction?: MouseEventHandler;
  cancelText?: string;
}

const FormSubmission: React.FC<IFormSubmissionProps> = (props): React.JSX.Element => (
  <div className="d-grid gap-2 mt-3">
    <Button type="submit" variant="success" disabled={props.disabled ?? false}>
      {props.submitText}
    </Button>
    {props.cancelAction && props.cancelText && (
      <Button variant="link" onClick={props.cancelAction}>
        {props.cancelText}
      </Button>
    )}
  </div>
);

export default FormSubmission;
