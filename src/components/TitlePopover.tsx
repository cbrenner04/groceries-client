import React, { ReactNode } from 'react';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';

interface ITitlePopoverProps {
  message: ReactNode;
  title: string;
}

const TitlePopover: React.FC<ITitlePopoverProps> = ({ message, title }) => (
  <OverlayTrigger
    trigger={['click']}
    placement="top"
    rootClose={true}
    overlay={
      <Popover>
        <Popover.Body data-test-id="popover-content">{message}</Popover.Body>
      </Popover>
    }
  >
    {({ ref, ...triggerHandler }) => (
      <Row className="m-0">
        <h2 className="text-capitalize pe-0 w-auto">{title}</h2>
        <i
          ref={ref}
          {...triggerHandler}
          className="far fa-question-circle float-end text-secondary ps-0 w-auto"
          data-test-id={`${title}-popover`}
        />
      </Row>
    )}
  </OverlayTrigger>
);

export default TitlePopover;
