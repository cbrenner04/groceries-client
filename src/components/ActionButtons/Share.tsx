import React, { type CSSProperties } from 'react';
import { Link } from 'react-router';

interface IShareProps {
  to: string;
  testID: string;
  disabled: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Share: React.FC<IShareProps> = (props): React.JSX.Element => {
  const providedStyles = props.style ?? {};
  const updatedStyles: CSSProperties = props.disabled ? { ...providedStyles, pointerEvents: 'none' } : providedStyles;
  return (
    <Link
      className={`p-0 me-3 ${props.classes ?? ''}`}
      to={props.to}
      data-test-id={props.testID}
      style={updatedStyles}
      aria-disabled={props.disabled}
    >
      <i className="fa fa-users fa-2x text-primary" />
    </Link>
  );
};

export default Share;
