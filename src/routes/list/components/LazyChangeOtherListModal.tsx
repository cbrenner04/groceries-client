import React from 'react';
import { createLazyComponent } from '../../../utils/lazyComponents';
import type { IChangeOtherListModalProps } from './ChangeOtherListModal';

// Lazy load the heavy ChangeOtherListModal component
const LazyChangeOtherListModal = createLazyComponent(() => import('./ChangeOtherListModal'));

const ChangeOtherListModal: React.FC<IChangeOtherListModalProps> = (props) => <LazyChangeOtherListModal {...props} />;

export default ChangeOtherListModal;
