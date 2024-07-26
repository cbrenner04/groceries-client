import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface ICompleteProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Complete: React.FC<ICompleteProps> = ({
  handleClick,
  testID,
  disabled = false,
  style = {},
  classes = '',
}): React.JSX.Element => (
  <Button
    variant="link"
    onClick={handleClick}
    className={`p-0 me-3 ${classes}`}
    data-test-id={testID}
    disabled={disabled}
    style={style}
  >
    <i className="fa fa-check fa-2x text-success" />
  </Button>
);

export default Complete;
