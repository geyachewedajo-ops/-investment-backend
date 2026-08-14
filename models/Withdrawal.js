const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    // =========================
    // CUSTOMER
    // =========================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // =========================
    // WITHDRAWAL AMOUNT
    // =========================
    amount: {
      type: Number,
      required: true,
      min: 1
    },

    // =========================
    // CBE ACCOUNT NAME
    // =========================
    accountName: {
      type: String,
      required: true,
      trim: true
    },

    // =========================
    // CBE ACCOUNT NUMBER
    // =========================
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },

    // =========================
    // PAYMENT METHOD
    // =========================
    paymentMethod: {
      type: String,
      default: "CBE",
      trim: true
    },

    // =========================
    // STATUS
    // =========================
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
