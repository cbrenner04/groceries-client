import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate } from 'react-router';

import { Skeleton } from 'components/ui/Skeleton';
import type { IListItemConfiguration } from 'typings';

import { fetchTemplates } from './utils';
import TemplatesContainer from './containers/TemplatesContainer';
import UnknownError from '../error_pages/UnknownError';

interface IFulfilledTemplates {
  templates: IListItemConfiguration[];
}

interface ITemplatesProps {
  initialEditTemplateId?: string | null;
}

const Templates: React.FC<ITemplatesProps> = (props): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Async promiseFn={fetchTemplates as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <div
          className={
            'tw:w-full tw:mx-auto tw:max-w-[var(--width-content)] ' +
            'tw:px-[var(--spacing-gutter)] tw:py-4 tw:space-y-3'
          }
        >
          <Skeleton variant="card" count={4} />
        </div>
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledTemplates | undefined): ReactNode => {
          if (!data) {
            return <UnknownError />;
          }
          return (
            <TemplatesContainer
              templates={data.templates}
              initialEditTemplateId={props.initialEditTemplateId ?? null}
            />
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default Templates;
