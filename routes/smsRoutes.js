const express = require('express');
const { sendSMS, getSmsCount } = require('../controllers/smsController');

const router = express.Router();

// Define the POST route
router.post('/send-message', sendSMS);
router.get('/count', getSmsCount);

module.exports = router;
