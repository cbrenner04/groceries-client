import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate } from 'react-router';

import Loading from 'components/Loading';
import type { IListItemConfiguration } from 'typings';

import { fetchTemplates } from './utils';
import TemplatesContainer from './containers/TemplatesContainer';
import UnknownError from '../error_pages/UnknownError';

interface IFulfilledTemplates {
  templates: IListItemConfiguration[];
}

const Templates: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Async promiseFn={fetchTemplates as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledTemplates | undefined): ReactNode => {
          // Handle the case where data might be undefined (e.g., when fetchTemplates returns undefined due to an error)
          if (!data) {
            return <UnknownError />;
          }

          return <TemplatesContainer templates={data.templates} />;
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default Templates;
