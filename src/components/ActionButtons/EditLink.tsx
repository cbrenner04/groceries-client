import React, { type CSSProperties } from 'react';
import { Link } from 'react-router';

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
      <i className="fa fa-edit fa-2x text-warning" />
    </Link>
  );
};

export default EditLink;
