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
        <Popover.Content>{message}</Popover.Content>
      </Popover>
    }
  >
    {({ ref, ...triggerHandler }) => (
      <Row style={{ margin: '0px' }}>
        <h2 className="text-capitalize">{title}</h2>
        <i ref={ref} {...triggerHandler} className="far fa-question-circle float-right text-secondary" />
      </Row>
    )}
  </OverlayTrigger>
);

TitlePopover.propTypes = {
  message: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

export default TitlePopover;
