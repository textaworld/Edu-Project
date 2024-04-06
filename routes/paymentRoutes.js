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
router.get('/calculateMonthlyIncome', paymentController.calculateMonthlyIncome);
router.get('/calculateDailyIncome', paymentController.calculateDailyIncome);
router.get('/calculateMonthlyIncomeByInstID', paymentController.calculateMonthlyIncomeByInstID);
router.get('/calculateDailyIncomeByInstID', paymentController.calculateDateIncomeByInstID);
router.get('/calculateIncomeByDate', paymentController.calculateIncomeByDate);
router.delete("/deletePayment/:id", paymentController.deletePayment);



module.exports = router;