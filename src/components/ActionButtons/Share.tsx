import React, { type CSSProperties } from 'react';
import { Link } from 'react-router';
import { UsersIcon } from '../icons';

interface IShareProps {
  to: string;
  testID: string;
  disabled: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Share: React.FC<IShareProps> = (props): React.JSX.Element => {
  const linkClassName =
    'tw:flex tw:items-center tw:justify-center tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded tw:transition-colors tw:duration-200 me-3';
  const providedStyles = props.style ?? {};
  const updatedStyles: CSSProperties = props.disabled ? { ...providedStyles, pointerEvents: 'none' } : providedStyles;

  return (
    <Link
      className={`${linkClassName} ${props.classes ?? ''}`}
      to={props.to}
      data-test-id={props.testID}
      style={updatedStyles}
      aria-disabled={props.disabled}
      aria-label="Share list"
    >
      <UsersIcon size="2x" className="text-primary" data-test-id="users-icon" />
    </Link>
  );
};

export default Share;
