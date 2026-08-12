



const express = require("express");
const mongoose = require("mongoose");
const Investment = require("../models/Investment");

const router = express.Router();

// ==========================================
// 40% DEMO RETURN AFTER 24 HOURS
// ==========================================
function calculateReturn(investment) {
  if (
    investment.status === "Approved" &&
    investment.maturityDate &&
    !investment.profitPaid
  ) {
    const now = new Date();

    if (now >= investment.maturityDate) {
      const amount = Number(investment.amount);

      const profit = amount * 0.40;
      const totalAmount = amount + profit;

      return {
        profit,
        totalAmount,
        profitPaid: true,
      };
    }
  }

  return null;
}

// ==========================================
// GET ALL INVESTMENTS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find()
      .sort({ createdAt: -1 });

    // Update matured demo investments
    for (const investment of investments) {
      const result = calculateReturn(investment);

      if (result) {
        investment.profit = result.profit;
        investment.totalAmount = result.totalAmount;
        investment.profitPaid = true;

        await investment.save();
      }
    }

    res.json(investments);

  } catch (error) {
    console.error("Get investments error:", error);

    res.status(500).json({
      message: "Failed to load investments",
      error: error.message,
    });
  }
});

// ==========================================
// GET ONE INVESTMENT
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid investment ID",
      });
    }

    const investment =
      await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // Check maturity
    const result = calculateReturn(investment);

    if (result) {
      investment.profit = result.profit;
      investment.totalAmount = result.totalAmount;
      investment.profitPaid = true;

      await investment.save();
    }

    res.json(investment);

  } catch (error) {
    console.error("Get investment error:", error);

    res.status(500).json({
      message: "Failed to load investment",
      error: error.message,
    });
  }
});

// ==========================================
// CREATE INVESTMENT
// ==========================================
router.post("/", async (req, res) => {
  try {
    console.log("Investment received:");
    console.log(req.body);

    const {
      planId,
      planName,
      commodity,
      amount,
      transactionId,
      paymentMethod,
    } = req.body;

    // Required fields
    if (!planId) {
      return res.status(400).json({
        message: "planId is required",
      });
    }

    if (!planName) {
      return res.status(400).json({
        message: "planName is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Valid investment amount is required",
      });
    }

    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({
        message: "Transaction ID is required",
      });
    }

    // ==========================================
    // 24-HOUR MATURITY DATE
    // ==========================================

    const createdDate = new Date();

    const maturityDate = new Date(
      createdDate.getTime() + 24 * 60 * 60 * 1000
    );

    // ==========================================
    // CREATE INVESTMENT
    // ==========================================

    const investment = new Investment({
      planId,
      planName,
      commodity,

      amount: Number(amount),

      transactionId: transactionId.trim(),

      paymentMethod:
        paymentMethod || "CBE",

      status: "Pending",

      profit: 0,

      totalAmount: Number(amount),

      maturityDate,

      profitPaid: false,

      date: createdDate,
    });

    // Save to MongoDB
    const savedInvestment =
      await investment.save();

    console.log(
      "✅ Investment saved:",
      savedInvestment._id
    );

    console.log(
      "⏰ Maturity:",
      savedInvestment.maturityDate
    );

    res.status(201).json({
      message: "Investment saved successfully",
      investment: savedInvestment,
    });

  } catch (error) {
    console.error(
      "❌ Save investment error:",
      error
    );

    res.status(500).json({
      message: "Failed to save investment",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE INVESTMENT STATUS
// ==========================================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Status must be Pending, Approved or Rejected",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid investment ID",
      });
    }

    const investment =
      await Investment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json({
      message: "Investment status updated",
      investment,
    });

  } catch (error) {
    console.error(
      "Update status error:",
      error
    );

    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE INVESTMENT
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid investment ID",
      });
    }

    const investment =
      await Investment.findByIdAndDelete(
        req.params.id
      );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    res.json({
      message: "Investment deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete investment error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete investment",
      error: error.message,
    });
  }
});

module.exports = router;
