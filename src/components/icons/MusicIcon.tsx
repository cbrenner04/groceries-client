import React from 'react';
import { Icon, type IIconProps } from './Icon';

export const MusicIcon: React.FC<IIconProps> = (props) => (
  <Icon {...props}>
    {/* eslint-disable-next-line max-len */}
    <path d="M512 56c0-30.9-25.1-56-56-56s-56 25.1-56 56V365.4c-9.4-5.4-20.3-8.7-32-8.7c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64V153.3L384 128v229.4c-9.4-5.4-20.3-8.7-32-8.7c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64V32c0-17.7 14.3-32 32-32s32 14.3 32 32V56z" />
  </Icon>
);
