import React from 'react';
import { createLazyComponent } from '../../../utils/lazyComponents';
import type { IEditListFormProps } from './EditListForm';

// Lazy load the heavy EditListForm component
const LazyEditListForm = createLazyComponent(() => import('./EditListForm'));

const EditListForm: React.FC<IEditListFormProps> = (props) => <LazyEditListForm {...props} />;

export default EditListForm;
