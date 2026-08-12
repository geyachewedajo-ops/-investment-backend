const express = require("express");
const router = express.Router();

const Withdrawal = require("../models/Withdrawal");

// =========================
// GET ALL WITHDRAWALS
// =========================

router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error("Load withdrawals error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// CREATE WITHDRAWAL
// =========================

router.post("/", async (req, res) => {
  try {
    const {
      amount,
      accountName,
      accountNumber,
      paymentMethod
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount."
      });
    }

    if (!accountName || !accountName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Account name is required."
      });
    }

    if (!accountNumber || !accountNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Account number is required."
      });
    }

    const withdrawal = new Withdrawal({
      amount: Number(amount),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      paymentMethod: paymentMethod || "CBE",
      status: "Pending"
    });

    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted.",
      withdrawal
    });
  } catch (err) {
    console.error("Create withdrawal error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// APPROVE / REJECT / PAID
// =========================

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Paid"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal status."
      });
    }

    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found."
      });
    }

    res.json({
      success: true,
      message: `Withdrawal ${status.toLowerCase()} successfully.`,
      withdrawal
    });
  } catch (err) {
    console.error("Update withdrawal error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
