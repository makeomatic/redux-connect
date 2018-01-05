const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const ignoreStyles = require('ignore-styles').default;
const serverRender = require('../babel-src/serverRender').default;

ignoreStyles();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(compression()); // gzip

app.use(morgan('combined')); // logger

app.use(express.static(path.resolve(__dirname, '..', 'build'), { index: false }));

app.use('/', function index(req, res) {
  const filePath = path.resolve(__dirname, '..', 'build', 'index.html');

  fs.readFile(filePath, { encoding: 'utf-8' }, function renderHtml(err, html) {
    if (err) {
      return res.status(404).end();
    }

    return serverRender(req, res, html);
  });
});

app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
