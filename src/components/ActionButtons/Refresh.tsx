import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IRefreshProps {
  handleClick: MouseEventHandler;
  testID: string;
  style?: CSSProperties;
  disabled?: boolean;
  classes?: string;
}

const Refresh: React.FC<IRefreshProps> = ({
  handleClick,
  testID,
  style = {},
  disabled = false,
  classes = '',
}): React.JSX.Element => (
  <Button
    variant="link"
    onClick={handleClick}
    className={`p-0 me-3 ${classes}`}
    data-test-id={testID}
    style={style}
    disabled={disabled}
  >
    <i className="fa fa-redo fa-2x text-primary" />
  </Button>
);

export default Refresh;
