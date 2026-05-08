import React from 'react';

import Lists from './Lists';

const CompletedLists: React.FC = (): React.JSX.Element => {
  return <Lists initialFilter="completed" />;
};

export default CompletedLists;
