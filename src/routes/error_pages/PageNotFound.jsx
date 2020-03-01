import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div>
      <h1>Page not found!</h1>
      <h2>Sorry but the page you are looking for was not found.</h2>
      <Link to="/">Return to the home page</Link>
    </div>
  );
}
