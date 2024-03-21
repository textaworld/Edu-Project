const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const requireAuth = require("../middleware/requirAuthAdmin");

router.use(requireAuth);

router.post("/createPayment", paymentController.createPayment);
router.get("/getAllPayments", paymentController.getAllPayments);
router.get('/getPaymentStatus', paymentController.getPaymentStatus);
router.get('/getAllPaymentsByInsId/:id',paymentController.getAllPaymentsByInsId);
router.get('/getAllPaymentStatusBystdId/:std_ID',paymentController.getAllPaymentStatusBystdId);

module.exports = router;