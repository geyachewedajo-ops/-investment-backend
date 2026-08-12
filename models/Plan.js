const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    minCapital: {
      type: Number,
      required: true
    },

    maxCapital: {
      type: Number
    },

    category: {
      type: String,
      default: "Commodity Trading"
    },

    commodity: {
      type: String,
      required: true
    },

    riskLevel: {
      type: String,
      required: true
    },

    image: {
      type: String
    },

    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Plan", planSchema, "Plan");
