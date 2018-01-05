import React from 'react';
import Switch from 'react-router/Switch';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Link from 'react-router-dom/Link';
import WrappedChildFirst from './WrappedChildFirst';
import WrappedChildSecond from './WrappedChildSecond';

export default function Wrapped({ value }) {
  return (
    <div>
      <h2>
        {'Wrapped component'}
      </h2>
      <div>
        {`lunch: ${value}`}
      </div>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        <li>
          <Link to="/wrapped/first">
            {'First child'}
          </Link>
        </li>
        <li>
          <Link to="/wrapped/second">
            {'Second child'}
          </Link>
        </li>
        <li>
          <Link to="/wrapped/redirect">
            {'Redirect to the first child'}
          </Link>
        </li>
      </ul>
      <Switch>
        <Route path="/wrapped" exact render={() => 'Wrapped component root'} />
        <Route path="/wrapped/first" component={WrappedChildFirst} />
        <Route path="/wrapped/second" component={WrappedChildSecond} />
        <Redirect to="/wrapped/first" />
      </Switch>
    </div>
  );
}
