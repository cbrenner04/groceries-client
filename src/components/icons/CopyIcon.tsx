import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const CopyIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    <path
      d="M384 336H192c-35.3 0-64-28.7-64-64V80c0-35.3 28.7-64 64-64h192c35.3 0 64 28.7 64 64v192c0
      35.3-28.7 64-64 64zM192 80v192h192V80H192z"
    />
    <path
      d="M64 176c0-35.3 28.7-64 64-64v64c0 8.8-7.2 16-16 16H64v192h192v-48h64v48c0 35.3-28.7
      64-64 64H64c-35.3 0-64-28.7-64-64V176z"
    />
  </Icon>
);
