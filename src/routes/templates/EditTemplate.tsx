import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import { fetchTemplateToEdit } from './utils';
import EditTemplateForm from './containers/EditTemplateForm';
import UnknownError from '../error_pages/UnknownError';

interface IEditTemplateData {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
}

const EditTemplate: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchTemplateToEdit as unknown as PromiseFn<void>} navigate={navigate} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IEditTemplateData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          if (!data) {
            return <UnknownError />;
          }

          return <EditTemplateForm template={data.template} fieldConfigurations={data.fieldConfigurations} />;
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default EditTemplate;
