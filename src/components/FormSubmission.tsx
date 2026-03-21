import React, { type MouseEventHandler } from 'react';
import { Button } from './ui/Button';

interface IFormSubmissionProps {
  disabled?: boolean;
  submitText: string;
  cancelAction?: MouseEventHandler;
  cancelText?: string;
  noGrid?: boolean;
}

const FormSubmission: React.FC<IFormSubmissionProps> = (props): React.JSX.Element => (
  <div className={`${props.noGrid ? '' : 'd-grid'} gap-2 mt-3`}>
    <Button type="submit" variant="success" disabled={props.disabled ?? false} fullWidth={!props.noGrid}>
      {props.submitText}
    </Button>
    {props.cancelAction && props.cancelText && (
      <Button variant="ghost" onClick={props.cancelAction} fullWidth={!props.noGrid}>
        {props.cancelText}
      </Button>
    )}
  </div>
);

export default FormSubmission;
