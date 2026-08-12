const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    planName: {
      type: String,
      required: true
    },

    commodity: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    transactionId: {
      type: String,
      required: true
    },

    paymentMethod: {
      type: String,
      default: "CBE"
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Investment",
  investmentSchema
);
