import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const MoveIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    <path
      d="M432 256L320 144v80h-80v-80L128 256l112 112v-80h80v80L432 256zM256 0l80 112h-64v80h-32v-80h-64L256
      0zM0 256l112-80v64h80v32h-80v64L0 256zM512 256L400 336v-64h-80v-32h80v-64L512 256zM256 512l-80-112h64v-80
      h32v80h64L256 512z"
    />
  </Icon>
);
