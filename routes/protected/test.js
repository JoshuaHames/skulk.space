const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/').get(verifyJWT, (req, res) => {
    res.render('WIP');
});

module.exports = router;
