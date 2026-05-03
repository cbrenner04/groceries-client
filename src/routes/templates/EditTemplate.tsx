import React from 'react';
import { useParams } from 'react-router';

import Templates from './Templates';

const EditTemplate: React.FC = (): React.JSX.Element => {
  const { id } = useParams();

  return <Templates initialEditTemplateId={id ?? null} />;
};

export default EditTemplate;
