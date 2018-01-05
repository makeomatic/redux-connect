const router = require('express').Router();
const endpoint = require('./endpoint');

router.get('/endpoint', endpoint);

module.exports = router;
