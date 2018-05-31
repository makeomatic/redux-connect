import React from 'react';
import { Provider } from 'react-redux';
import StaticRouter from 'react-router/StaticRouter';
import { renderToString } from 'react-dom/server';
import url from 'url';
import { ReduxAsyncConnect, loadOnServer } from '../../../';
import configureStore from './store';
import routes from './routes';
import * as helpers from './helpers';

export default function serverRender(req, res, html) {
  const store = configureStore();
  // loadOnServer expecting location object (with pathname property)
  const location = url.parse(req.url);

  // traversing the matched tree and collecting data
  loadOnServer({ store, location, routes, helpers })
    .then(() => {
      // context object to collect rendering side effects (redirects, status code etc.)
      const context = {};

      const markup = renderToString(
        <Provider store={store}>
          {/* passing the context and the same location as to loadOnServer fn */}
          <StaticRouter location={location} context={context}>
            <ReduxAsyncConnect routes={routes} helpers={helpers} />
          </StaticRouter>
        </Provider>
      );

      // handling redirects either from <Redirect> component or from staticContext
      if (context.url) {
        return res.redirect(302, context.url);
      }

      const responseHtml = html
        .replace('{{SSR}}', markup)
        .replace('{{DATA}}', JSON.stringify(store.getState()));

      return res.status(context.code || 200).send(responseHtml);
    })
    .catch(() => res.status(500).end());
}

