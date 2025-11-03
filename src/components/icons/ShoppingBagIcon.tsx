import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const ShoppingBagIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    {/* eslint-disable-next-line max-len */}
    <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM96 192c0-17.7 14.3-32 32-32s32 14.3 32 32c0 53 43 96 96 96s96-43 96-96c0-17.7 14.3-32 32-32s32 14.3 32 32c0 70.7-57.3 128-128 128s-128-57.3-128-128z" />
  </Icon>
);
