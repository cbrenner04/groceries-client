import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const BookIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    {/* eslint-disable-next-line max-len */}
    <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384V32H96zM64 224c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zm32 64H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zM224 448H96c-53 0-96-43-96-96V96C0 43 43 0 96 0H512c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H256V448z" />
  </Icon>
);
