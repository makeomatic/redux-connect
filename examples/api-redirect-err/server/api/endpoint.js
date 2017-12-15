const Promise = require('bluebird');

function endpoint(req, res) {
  return Promise
    .delay(200, { id: 1, value: 'Borsch' })
    .then(val => res.json(val));
}

module.exports = endpoint;
