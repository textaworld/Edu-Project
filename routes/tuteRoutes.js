const express = require('express');
const router = express.Router();
const tuteController = require('../controllers/tuteController');
const requireAuth = require("../middleware/requirAuthAdmin");

router.use(requireAuth);

router.post("/createTute", tuteController.createTute);
router.get("/getAllTutes", tuteController.getAllTutes);
router.get('/getTuteStatus',tuteController.getTuteStatus);

module.exports = router;