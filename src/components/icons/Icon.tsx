import React from 'react';

export interface IIconProps {
  className?: string;
  size?: 'sm' | 'lg' | '2x' | '3x';
}

const sizeMap = {
  sm: 14,
  lg: 20,
  '2x': 32,
  '3x': 48,
};

export const Icon: React.FC<IIconProps & { children: React.ReactNode }> = (props) => {
  const { className, size = 'lg', children } = props;
  const dimension = sizeMap[size];

  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={dimension}
      height={dimension}
      fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...props}
    >
      {children}
    </svg>
  );
};
