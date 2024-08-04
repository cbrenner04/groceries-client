import React, { type ReactNode } from 'react';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { type OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';

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
    {(overlayProps: OverlayTriggerRenderProps): React.JSX.Element => (
      <Row className="m-0">
        <h2 className="text-capitalize pe-0 w-auto">{props.title}</h2>
        <i
          {...overlayProps}
          className="far fa-question-circle float-end text-secondary ps-0 w-auto"
          data-test-id={`${props.title}-popover`}
        />
      </Row>
    )}
  </OverlayTrigger>
);

export default TitlePopover;
