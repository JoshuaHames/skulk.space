const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middleware/verifyRoles');
// Admin Protected Route

router.get('/', verifyRoles(ROLES_LIST.Admin), (req, res, next) => {
    next()
});

module.exports = router;