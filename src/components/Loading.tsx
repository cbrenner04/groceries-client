import React from 'react';

const Loading: React.FC = (): React.JSX.Element => (
  <div id="loader">
    <div
      role="status"
      id="spinner"
      className={
        'tw:inline-block tw:h-8 tw:w-8 tw:animate-spin tw:rounded-full ' +
        'tw:border-4 tw:border-current tw:border-t-transparent'
      }
    >
      <span className="tw:sr-only">Loading...</span>
    </div>
  </div>
);

export default Loading;
