import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import AcceptedLists from './AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';

function CompleteLists(props) {
  const message = props.fullList ? (
    'Previously refreshed lists are marked with an asterisk (*).'
  ) : (
    <>
      These are the completed lists most recently created.&nbsp;
      <Link to="/completed_lists">See all completed lists here.</Link>&nbsp; Previously refreshed lists are marked with
      an asterisk (*).
    </>
  );
  return <AcceptedLists title={<TitlePopover title="Completed" message={message} />} completed={true} {...props} />;
}

CompleteLists.propTypes = {
  fullList: PropTypes.bool,
};

CompleteLists.defaultProps = {
  fullList: false,
};

export default CompleteLists;
