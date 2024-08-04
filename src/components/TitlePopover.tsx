import React, { type ReactNode } from 'react';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';

interface ITitlePopoverProps {
  message: ReactNode;
  title: string;
}

const TitlePopover: React.FC<ITitlePopoverProps> = (props): React.JSX.Element => (
  <OverlayTrigger
    trigger={['click']}
    placement="top"
    rootClose={true}
    overlay={
      <Popover>
        <Popover.Body data-test-id="popover-content">{props.message}</Popover.Body>
      </Popover>
    }
  >
    {({ ref, ...triggerHandler }): React.JSX.Element => ( // eslint-disable-line destructuring/in-params
      <Row className="m-0">
        <h2 className="text-capitalize pe-0 w-auto">{props.title}</h2>
        <i
          ref={ref}
          {...triggerHandler}
          className="far fa-question-circle float-end text-secondary ps-0 w-auto"
          data-test-id={`${props.title}-popover`}
        />
      </Row>
    )}
  </OverlayTrigger>
);

export default TitlePopover;
