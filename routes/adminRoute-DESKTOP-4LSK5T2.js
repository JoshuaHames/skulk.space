const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middleware/verifyRoles');
// Admin Protected Route

console.log(ROLES_LIST.Admin)
router.get('/', verifyRoles(ROLES_LIST.Admin), (req, res) => {
    res.status(200).json({ message: 'Admin Route Accessed' });
});

module.exports = router;