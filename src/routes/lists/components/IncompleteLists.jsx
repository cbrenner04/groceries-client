import React from 'react';

import AcceptedLists from './AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';

const IncompleteLists = (props) => (
  <AcceptedLists
    title={
      <TitlePopover
        title="Incomplete"
        message="These are lists you've created or you've accepted an invitation from someone else."
      />
    }
    completed={false}
    {...props}
  />
);

export default IncompleteLists;
