const express = require('express');
const router = express.Router();
const quarryController = require('../controllers/quarryController');

router.post('/', quarryController.quarryUserDetails);

module.exports = router;