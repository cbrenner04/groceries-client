import React from 'react';
import { useNavigate } from 'react-router';

import { EmptyState } from 'components/domain/EmptyState';
import { PageLayout } from 'components/layout/PageLayout';
import { QuestionCircleIcon } from 'components/icons';

const getErrorTitle = (): string => 'Something went wrong!';
const getErrorDescription = (): string => 'We are currently unable to render this page.';
const getRefreshLabel = (): string => 'refresh the page';

const UnknownError: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <EmptyState
        icon={<QuestionCircleIcon size="3x" />}
        title={getErrorTitle()}
        description={getErrorDescription()}
        action={{ label: getRefreshLabel(), onClick: (): void => void navigate(0) }}
      />
    </PageLayout>
  );
};

export default UnknownError;
