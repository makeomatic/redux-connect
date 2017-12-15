const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const api = require('./api');
const ignoreStyles = require('ignore-styles').default;
const serverRender = require('../babel-src/serverRender').default;

ignoreStyles();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(compression());

app.use(morgan('combined'));

app.use(express.static(path.resolve(__dirname, '..', 'build'), { index: false }));

app.use('/api', api);

app.use('/', function renderApp(req, res) {
  const filePath = path.resolve(__dirname, '..', 'build', 'index.html');

  fs.readFile(filePath, { encoding: 'utf-8' }, function render(err, html) {
    if (err) {
      return res.status(404).end();
    }

    return serverRender(req, res, html);
  });
});

app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
