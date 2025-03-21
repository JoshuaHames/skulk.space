const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list')
const modController = require('../../controllers/modController');
const verifyRoles = require('../../middleware/verifyRoles');

// Admin Protected Route

router.post('/', verifyRoles(ROLES_LIST.Admin), modController.updatePass)

module.exports = router;