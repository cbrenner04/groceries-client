import React from 'react';
import { Icon, type IIconProps } from './Icon';

export interface IBookmarkIconProps extends IIconProps {
  solid?: boolean;
}

export const BookmarkIcon: React.FC<IBookmarkIconProps> = (iconProps) => {
  const { solid = false, ...props } = iconProps;
  return (
    <Icon {...props}>
      {solid ? (
        // Solid bookmark
        <path
          d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14
          4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"
        />
      ) : (
        // Regular (outline) bookmark
        <path
          d="M48 0C21.5 0 0 21.5 0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7
          507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48zM64 48H320V447.1L192
          361.7 64 447.1V48z"
        />
      )}
    </Icon>
  );
};
