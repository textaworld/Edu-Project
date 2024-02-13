const express = require('express');
const qrRouter = express.Router();
const { qrGenerator } = require('../controllers/QrGenerator'); // Fix the import
const requireAuth = require("../middleware/requirAuthAdmin");

qrRouter.use(requireAuth);

qrRouter.post("/qrGenerator", qrGenerator);

module.exports = qrRouter;
