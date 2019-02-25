import React from 'react';
import Link from 'react-router-dom/Link';
import { renderRoutes } from 'react-router-config';

function Wrapped({ route, lunch }) {
  return (
    <div>
      <h2>
        {'Wrapped component'}
      </h2>
      <div>
        {`lunch: ${lunch}`}
      </div>
      <Link to="/wrapped/child">
        {'Wrapped child'}
      </Link>
      {renderRoutes(route.routes)}
    </div>
  );
}

export default Wrapped;
