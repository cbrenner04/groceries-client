import React, { type CSSProperties } from 'react';
import { Link } from 'react-router';
import { EditIcon } from '../icons';

interface IEditLinkProps {
  to: string;
  style?: CSSProperties;
  testID: string;
  classes?: string;
  disabled?: boolean;
}

const EditLink: React.FC<IEditLinkProps> = (props): React.JSX.Element => {
  const providedStyles = props.style ?? {};
  const updatedStyles: CSSProperties = props.disabled ? { ...providedStyles, pointerEvents: 'none' } : providedStyles;
  return (
    <Link
      className={`p-0 me-3 ${props.classes ?? ''}`}
      to={props.to}
      style={updatedStyles}
      data-test-id={props.testID}
      aria-disabled={props.disabled ?? false}
    >
      <EditIcon size="2x" className="text-warning" data-test-id="edit-icon" />
    </Link>
  );
};

export default EditLink;
