import React from 'react';
import Link from 'react-router-dom/Link';
import { renderRoutes } from 'react-router-config';

import './App.css';

function App({ route }) {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">
          {'redux-connect example with ssr, api call, redirect, 404'}
        </h1>
      </header>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        <li>
          <Link to="/">
            {'Root (redirects to second child)'}
          </Link>
        </li>
        <li>
          <Link to="/wrapped">
            {'Wrapped component'}
          </Link>
        </li>
        <li>
          <Link to="/unwrapped">
            {'Unwrapped component'}
          </Link>
        </li>
        <li>
          <Link to="/non-existing-route">
            {'Non existing route'}
          </Link>
        </li>
      </ul>
      <div>
        {renderRoutes(route.routes)}
      </div>
    </div>
  );
}

export default App;
