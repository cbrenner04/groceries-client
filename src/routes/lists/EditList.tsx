import React from 'react';
import { useParams } from 'react-router';

import Lists from './Lists';

const EditList: React.FC = (): React.JSX.Element => {
  const { id } = useParams();

  return <Lists initialEditListId={id ?? null} />;
};

export default EditList;
