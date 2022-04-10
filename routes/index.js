const router = require('express').Router();

router.get('/api', (req, res) => {
    return res.sendStatus(200);
})

module.exports = router;