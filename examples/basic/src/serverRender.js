import React from 'react';
import url from 'url';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import StaticRouter from 'react-router/StaticRouter';
import { ReduxAsyncConnect, loadOnServer } from '../../../';
import configureStore from './store';
import routes from './routes';
import * as helpers from './helpers';

export default function serverRender(req, res, html) {
  const store = configureStore();
  const location = url.parse(req.url);

  loadOnServer({ store, location, routes, helpers })
    .then(() => {
      const context = {};

      const markup = renderToString(
        <Provider store={store}>
          <StaticRouter location={req.url} context={context}>
            <ReduxAsyncConnect routes={routes} helpers={helpers} />
          </StaticRouter>
        </Provider>
      );

      if (context.url) {
        return res.redirect(302, context.url);
      }

      const responseData = html.replace('{{SSR}}', markup)
        .replace('{{DATA}}', JSON.stringify(store.getState()));

      return res.status(context.code || 200).send(responseData);
    })
    .catch(() => res.status(500).end());
}
