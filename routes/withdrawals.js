



















const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Withdrawal = require("../models/Withdrawal");
const Investment = require("../models/Investment");

// =====================================================
// GET ALL WITHDRAWALS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals
    });

  } catch (error) {
    console.error("GET WITHDRAWALS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load withdrawals",
      error: error.message
    });
  }
});

// =====================================================
// GET AVAILABLE BALANCE
// =====================================================

router.get("/balance", async (req, res) => {
  try {
    const investments =
      await Investment.find({
        status: "Approved"
      });

    let totalInvested = 0;

    for (const investment of investments) {
      const amount =
        Number(investment.amount || 0);

      const profit =
        Number(investment.profit || 0);

      const totalAmount =
        Number(investment.totalAmount || 0);

      if (totalAmount > 0) {
        totalInvested += totalAmount;
      } else {
        totalInvested += amount + profit;
      }
    }

    const withdrawals =
      await Withdrawal.find({
        status: {
          $in: ["Approved", "Paid"]
        }
      });

    let totalWithdrawn = 0;

    for (const withdrawal of withdrawals) {
      totalWithdrawn +=
        Number(withdrawal.amount || 0);
    }

    const availableBalance =
      Math.max(
        0,
        totalInvested - totalWithdrawn
      );

    res.status(200).json({
      success: true,
      totalInvested,
      totalWithdrawn,
      availableBalance
    });

  } catch (error) {
    console.error("BALANCE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate available balance",
      error: error.message
    });
  }
});

// =====================================================
// CREATE WITHDRAWAL
// =====================================================

router.post("/", async (req, res) => {
  try {

    const {
      userId,
      amount,
      accountName,
      accountNumber,
      paymentMethod
    } = req.body;

    // -----------------------------------------
    // VALIDATE USER
    // -----------------------------------------

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required."
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId."
      });
    }

    // -----------------------------------------
    // VALIDATE AMOUNT
    // -----------------------------------------

    const withdrawalAmount =
      Number(amount);

    if (
      !withdrawalAmount ||
      withdrawalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount."
      });
    }

    // -----------------------------------------
    // VALIDATE ACCOUNT NAME
    // -----------------------------------------

    if (
      !accountName ||
      !accountName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Account name is required."
      });
    }

    // -----------------------------------------
    // VALIDATE ACCOUNT NUMBER
    // -----------------------------------------

    if (
      !accountNumber ||
      !accountNumber.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Account number is required."
      });
    }

    // -----------------------------------------
    // APPROVED INVESTMENTS
    // -----------------------------------------

    const investments =
      await Investment.find({
        status: "Approved",
        userId: userId
      });

    let availableBalance = 0;

    for (const investment of investments) {

      const investmentAmount =
        Number(investment.amount || 0);

      const profit =
        Number(investment.profit || 0);

      const totalAmount =
        Number(investment.totalAmount || 0);

      if (totalAmount > 0) {
        availableBalance += totalAmount;
      } else {
        availableBalance +=
          investmentAmount + profit;
      }
    }

    // -----------------------------------------
    // PREVIOUS WITHDRAWALS
    // -----------------------------------------

    const previousWithdrawals =
      await Withdrawal.find({
        userId: userId,
        status: {
          $in: [
            "Approved",
            "Paid"
          ]
        }
      });

    for (
      const withdrawal
      of previousWithdrawals
    ) {
      availableBalance -=
        Number(withdrawal.amount || 0);
    }

    availableBalance =
      Math.max(
        0,
        availableBalance
      );

    // -----------------------------------------
    // CHECK BALANCE
    // -----------------------------------------

    if (
      withdrawalAmount >
      availableBalance
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Insufficient available balance. Available balance is ${availableBalance.toLocaleString()} Birr.`,
        availableBalance
      });
    }

    // -----------------------------------------
    // CREATE WITHDRAWAL
    // -----------------------------------------

    const withdrawal =
      new Withdrawal({
        userId: userId,

        amount:
          withdrawalAmount,

        accountName:
          accountName.trim(),

        accountNumber:
          accountNumber.trim(),

        paymentMethod:
          paymentMethod || "CBE",

        status:
          "Pending"
      });

    await withdrawal.save();

    console.log(
      "✅ WITHDRAWAL SAVED:",
      withdrawal._id,
      "USER:",
      userId
    );

    res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted.",
      withdrawal,
      availableBalance
    });

  } catch (error) {

    console.error(
      "CREATE WITHDRAWAL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create withdrawal",
      error: error.message
    });
  }
});

// =====================================================
// APPROVE / REJECT / PAID
// =====================================================

router.put("/:id/status", async (req, res) => {
  try {

    const {
      status
    } = req.body;

    // -----------------------------------------
    // VALID STATUS
    // -----------------------------------------

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Paid"
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid withdrawal status."
      });
    }

    // -----------------------------------------
    // VALID ID
    // -----------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid withdrawal ID."
      });
    }

    // -----------------------------------------
    // FIND WITHDRAWAL
    // -----------------------------------------

    const withdrawal =
      await Withdrawal.findById(
        req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message:
          "Withdrawal not found."
      });
    }

    // -----------------------------------------
    // UPDATE STATUS
    // -----------------------------------------

    withdrawal.status =
      status;

    await withdrawal.save();

    console.log(
      "✅ WITHDRAWAL STATUS UPDATED:",
      withdrawal._id,
      status
    );

    res.status(200).json({
      success: true,
      message:
        `Withdrawal ${status.toLowerCase()} successfully.`,
      withdrawal
    });

  } catch (error) {

    console.error(
      "UPDATE WITHDRAWAL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update withdrawal",
      error: error.message
    });
  }
});

// =====================================================
// DELETE WITHDRAWAL
// =====================================================

router.delete("/:id", async (req, res) => {
  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid withdrawal ID."
      });
    }

    const withdrawal =
      await Withdrawal.findByIdAndDelete(
        req.params.id
      );

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message:
          "Withdrawal not found."
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Withdrawal deleted successfully."
    });

  } catch (error) {

    console.error(
      "DELETE WITHDRAWAL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete withdrawal",
      error: error.message
    });
  }
});

module.exports = router;
