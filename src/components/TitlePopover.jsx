import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover, Row } from 'react-bootstrap';

const TitlePopover = ({ message, title }) => (
  <OverlayTrigger
    trigger={['click']}
    placement="top"
    rootClose={true}
    overlay={
      <Popover>
        <Popover.Content data-test-id="popover-content">{message}</Popover.Content>
      </Popover>
    }
  >
    {({ ref, ...triggerHandler }) => (
      <Row className="title-popover-row">
        <h2 className="text-capitalize">{title}</h2>
        <i
          ref={ref}
          {...triggerHandler}
          className="far fa-question-circle float-right text-secondary"
          data-test-id={`${title}-popover`}
        />
      </Row>
    )}
  </OverlayTrigger>
);

TitlePopover.propTypes = {
  message: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

export default TitlePopover;
