// models/OTP.model.js
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpire: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '10m' } // Auto-delete after 10 minutes
  }
});

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;