const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1
    },

    accountName: {
      type: String,
      required: true,
      trim: true
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true
    },

    paymentMethod: {
      type: String,
      default: "CBE"
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Paid"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Withdrawal",
  withdrawalSchema
);
