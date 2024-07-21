import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface IEditLinkProps {
  to: string;
  style?: CSSProperties;
  testID: string;
  classes?: string;
  disabled?: boolean;
}

const EditLink: React.FC<IEditLinkProps> = ({ to, style = {}, testID, classes = '', disabled = false }) => {
  const updatedStyles: CSSProperties = disabled ? { ...style, pointerEvents: 'none' } : style;
  return (
    <Link className={`p-0 me-3 ${classes}`} to={to} style={updatedStyles} data-test-id={testID}>
      <i className="fa fa-edit fa-2x text-warning" />
    </Link>
  );
};

export default EditLink;
