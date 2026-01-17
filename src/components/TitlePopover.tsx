import React, { type ReactNode } from 'react';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { type OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';
import { QuestionCircleIcon } from './icons';

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
        <button
          {...overlayProps}
          type="button"
          className="float-end text-secondary ps-0 w-auto border-0 bg-transparent align-self-start"
          data-test-id={`${props.title}-popover`}
          style={{ cursor: 'pointer', lineHeight: 1 }}
        >
          <QuestionCircleIcon size="sm" />
        </button>
      </Row>
    )}
  </OverlayTrigger>
);

export default TitlePopover;
