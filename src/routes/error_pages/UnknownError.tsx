import React, { useState } from 'react';

export default function UnknownError() {
  const [hover, setHover] = useState(false);

  const buttonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'inline',
    margin: 0,
    padding: 0,
    color: hover ? '#0056b3' : '#007bff',
    textDecoration: hover ? 'underline' : 'none',
  };

  return (
    <>
      <h1>Something went wrong!</h1>
      <h2>We are currently unable to render this page.</h2>
      <p>
        Please check your connection and try to &nbsp;
        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => window.location.reload()}
          style={buttonStyles}
        >
          refresh the page
        </button>
      </p>
    </>
  );
}
