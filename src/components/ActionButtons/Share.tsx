import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface IShareProps {
  to: string;
  testID: string;
  disabled: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Share: React.FC<IShareProps> = ({ to, testID, disabled, style = {}, classes = '' }) => {
  const updatedStyles: CSSProperties = disabled ? { ...style, pointerEvents: 'none' } : style;
  return (
    <Link
      className={`p-0 me-3 ${classes || ''}`}
      to={to}
      data-test-id={testID}
      style={updatedStyles}
      aria-disabled={disabled}
    >
      <i className="fa fa-users fa-2x text-primary" />
    </Link>
  );
};

export default Share;
