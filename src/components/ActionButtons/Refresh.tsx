import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IRefreshProps {
  handleClick: MouseEventHandler;
  testID: string;
  style?: CSSProperties;
  disabled?: boolean;
  classes?: string;
}

const Refresh: React.FC<IRefreshProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className={`p-0 me-3 ${props.classes ?? ''}`}
    data-test-id={props.testID}
    style={props.style ?? {}}
    disabled={props.disabled ?? false}
  >
    <i className="fa fa-redo fa-2x text-primary" />
  </Button>
);

export default Refresh;
