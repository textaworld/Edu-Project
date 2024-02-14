const PaymentModel = require("../models/paymentModel");

const createPayment = (req, res) => {
  const {
    inst_ID,
    std_ID,
    name,
    amount,
    month,
    classID,
    className,
    status,
    date,
  } = req.body;

  const newPayment = new PaymentModel({
    inst_ID,
    std_ID,
    name,
    amount,
    month,
    classID,
    className,
    status,
    date,
  });

  newPayment
    .save()
    .then((payment) => res.json(payment))
    .catch((err) => res.json({ error: err.message }));
};

const getAllPayments = (req, res) => {
  PaymentModel.find()
    .then((payment) => res.json(payment))
    .catch((err) => res.json({ error: err.message }));
};

const getPaymentStatus = async (req, res) => {
  const { std_ID, classID, month } = req.query;

  try {
    // Assuming your PaymentModel has a field for class name, adjust the query accordingly
    const payment = await PaymentModel.findOne({ std_ID, classID, month });

    if (!payment) {
      return res.status(404).json({ status: "not found" });
    }

    return res.json({ status: payment.status });
  } catch (error) {
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPaymentsByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const payments = await PaymentModel.find({ inst_ID: id }).sort({
      createdAt: -1,
    });

    if (!payments || payments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No payments found", data: null });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "payments fetched successfully",
        data: payments,
      });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentStatus,
  getAllPaymentsByInsId,
};