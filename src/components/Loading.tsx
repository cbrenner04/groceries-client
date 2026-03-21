import React from 'react';

const Loading: React.FC = (): React.JSX.Element => (
  <div id="loader">
    <div
      role="status"
      id="spinner"
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default Loading;
