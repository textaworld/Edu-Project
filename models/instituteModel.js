const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instituteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  notification: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
  },
  image: {
    type: String,
  },
  instPackage: {
    type: Number,
  },
  packageStatus: {
    type: String,
  },
  currentTime: {
    type: Date,
    
  },
  expireTime: {
    type: Date,
  },
});

module.exports = mongoose.model("Institute", instituteSchema);
