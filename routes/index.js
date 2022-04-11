const router = require('express').Router();
const ipMiddleware = require('../util/rate-limit-middleware');

router.get('/api', ipMiddleware, (req, res) => {
    return res.sendStatus(200);
})

module.exports = router;