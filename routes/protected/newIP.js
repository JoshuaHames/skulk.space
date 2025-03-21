const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles');
const registerController = require('../../controllers/registerControllers');

router.post('/', registerController.CheckandLogIP);

module.exports = router;