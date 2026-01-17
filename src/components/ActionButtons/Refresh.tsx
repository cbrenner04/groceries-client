import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { RedoIcon } from '../icons';

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
    <RedoIcon size="2x" className="text-primary" data-test-id="redo-icon" />
  </Button>
);

export default Refresh;
