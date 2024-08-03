import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface ICompleteProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Complete: React.FC<ICompleteProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className={`p-0 me-3 ${props.classes ?? ''}`}
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
    style={props.style ?? {}}
  >
    <i className="fa fa-check fa-2x text-success" />
  </Button>
);

export default Complete;
