import React from 'react';

export interface ISkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'list';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const baseStyles = 'tw:bg-[var(--color-surface-overlay)] tw:rounded tw:animate-pulse';

const variantStyles: Record<string, { width: string; height: string }> = {
  text: { width: '100%', height: '1.25rem' },
  card: { width: '100%', height: '12rem' },
  circle: { width: '3rem', height: '3rem' },
  list: { width: '100%', height: '1.25rem' },
};

export function Skeleton(props: ISkeletonProps): React.JSX.Element {
  const { variant = 'text', width, height, count = 1, className = '' } = props;
  const variantStyle = variantStyles[variant];
  const finalWidth = width || variantStyle.width;
  const finalHeight = height || variantStyle.height;

  if (variant === 'circle') {
    return (
      <div
        className={`${baseStyles} tw:rounded-full ${className}`.trim()}
        style={{
          width: finalWidth,
          height: finalHeight,
        }}
      />
    );
  }

  if (variant === 'list') {
    return (
      <div className="tw:space-y-2">
        {Array.from({ length: count }).map((i, index) => (
          <div
            key={`skeleton-${index}`}
            className={baseStyles}
            style={{
              width: finalWidth,
              height: finalHeight,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${className}`.trim()}
      style={{
        width: finalWidth,
        height: finalHeight,
      }}
    />
  );
}
