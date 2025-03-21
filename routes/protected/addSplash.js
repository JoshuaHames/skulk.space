const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list')
const splashController = require('../../controllers/splashController');
const verifyRoles = require('../../middleware/verifyRoles');
// Admin Protected Route

router.post('/', verifyRoles(ROLES_LIST.Admin), splashController.addLine)

module.exports = router;