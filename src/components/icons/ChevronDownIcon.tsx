import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const ChevronDownIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    <path
      d="M256 294.1L79.5 117.5c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l199.1 199.1c12.5 12.5 32.8 12.5
      45.3 0l199.1-199.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 294.1z"
    />
  </Icon>
);
