const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')
const testController = require('../../controllers/testController')

router.route('/')
    .get(verifyRoles(ROLES_LIST.User), testController.getTest)

module.exports = router;
