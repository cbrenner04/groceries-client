import React from 'react';
import { createLazyComponent } from '../../../utils/lazyComponents';
import type { IMergeModalProps } from './MergeModal';

// Lazy load the heavy MergeModal component
const LazyMergeModal = createLazyComponent(() => import('./MergeModal'));

const MergeModal: React.FC<IMergeModalProps> = (props) => <LazyMergeModal {...props} />;

export default MergeModal;
