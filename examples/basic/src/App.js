import React from 'react';
import Link from 'react-router-dom/Link';
import { renderRoutes } from 'react-router-config';
import './App.css';

function App({ route }) {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Redux-Connect basic routing example with SSR</h1>
      </header>
      <ul className="App-route-list">
        <li>
          <Link to="/">
            {'Root'}
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
      </ul>
      {renderRoutes(route.routes)}
    </div>
  );
}

export default App;
