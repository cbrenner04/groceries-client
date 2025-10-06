import React from 'react';
import { createLazyComponent } from '../../../utils/lazyComponents';
import type { IBulkEditListItemsFormProps } from './BulkEditListItemsForm';

// Lazy load the heavy BulkEditListItemsForm component
const LazyBulkEditListItemsForm = createLazyComponent(() => import('./BulkEditListItemsForm'));

const BulkEditListItemsForm: React.FC<IBulkEditListItemsFormProps> = (props) => (
  <LazyBulkEditListItemsForm {...props} />
);

export default BulkEditListItemsForm;
