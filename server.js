const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");
const Plan = require("./models/Plan");
const Investment = require("./models/Investment");
const Withdrawal = require("./models/Withdrawal");
const investmentRoutes = require("./routes/investments");
const withdrawalRoutes = require("./routes/withdrawals");
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/investments", investmentRoutes);
app.use("/auth", authRoutes);
app.use("/withdrawals", withdrawalRoutes);

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.send("💎 Wedajo Investment API Running");
});

/* =========================
   PLANS
========================= */

app.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({
      message: "Failed to load investment plans"
    });
  }
});

app.post("/plans", async (req, res) => {
  try {
    const plan = new Plan(req.body);
    const savedPlan = await plan.save();

    res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Create plan error:", error);

    res.status(500).json({
      message: "Failed to create investment plan",
      error: error.message
    });
  }
});

app.put("/plans/:id", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found"
      });
    }

    res.json(plan);
  } catch (error) {
    console.error("Update plan error:", error);

    res.status(500).json({
      message: "Failed to update plan",
      error: error.message
    });
  }
});

app.delete("/plans/:id", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found"
      });
    }

    res.json({
      message: "Plan deleted successfully"
    });
  } catch (error) {
    console.error("Delete plan error:", error);

    res.status(500).json({
      message: "Failed to delete plan",
      error: error.message
    });
  }
});

/* =========================
   INVESTMENTS
========================= */

/* Get all investments */

app.get("/investments", async (req, res) => {
  try {
    const investments = await Investment.find()
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error("Get investments error:", error);

    res.status(500).json({
      message: "Failed to load investments",
      error: error.message
    });
  }
});

/* Create investment */

app.post("/investments", async (req, res) => {
  try {
    console.log("Investment received:", req.body);

    const {
      planId,
      planName,
      commodity,
      amount,
      transactionId,
      paymentMethod,
      status,
      date
    } = req.body;

    if (!planId) {
      return res.status(400).json({
        message: "planId is required"
      });
    }

    if (!planName) {
      return res.status(400).json({
        message: "planName is required"
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Valid investment amount is required"
      });
    }

    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({
        message: "Transaction ID is required"
      });
    }

    const investment = new Investment({
      planId,
      planName,
      commodity,
      amount: Number(amount),
      transactionId: transactionId.trim(),
      paymentMethod: paymentMethod || "CBE",
      status: status || "Pending",
      date: date ? new Date(date) : new Date()
    });

    const savedInvestment = await investment.save();

    console.log("Investment saved:", savedInvestment);

    res.status(201).json(savedInvestment);

  } catch (error) {
    console.error("Save investment error:", error);

    res.status(500).json({
      message: "Investment could not be saved",
      error: error.message
    });
  }
});

/* Get one investment */

app.get("/investments/:id", async (req, res) => {
  try {
    const investment = await Investment.findById(
      req.params.id
    );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found"
      });
    }

    res.json(investment);

  } catch (error) {
    console.error("Get investment error:", error);

    res.status(500).json({
      message: "Failed to load investment",
      error: error.message
    });
  }
});

/* Update investment status */

app.put("/investments/:id", async (req, res) => {
  try {
    const investment =
      await Investment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found"
      });
    }

    res.json(investment);

  } catch (error) {
    console.error("Update investment error:", error);

    res.status(500).json({
      message: "Failed to update investment",
      error: error.message
    });
  }
});

/* Delete investment */

app.delete("/investments/:id", async (req, res) => {
  try {
    const investment =
      await Investment.findByIdAndDelete(
        req.params.id
      );

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found"
      });
    }

    res.json({
      message: "Investment deleted successfully"
    });

  } catch (error) {
    console.error("Delete investment error:", error);

    res.status(500).json({
      message: "Failed to delete investment",
      error: error.message
    });
  }
});

/* =========================
   PRODUCTS
========================= */

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
      error: error.message
    });
  }
});

app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
});

/* =========================
   ORDERS
========================= */

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load orders",
      error: error.message
    });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
});

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB Error:", error);
  });

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;


app.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({
      createdAt: -1
    });

    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

app.post("/withdrawals", async (req, res) => {
  try {
    const withdrawal = new Withdrawal({
      amount: req.body.amount,
      accountName: req.body.accountName,
      accountNumber: req.body.accountNumber,
      paymentMethod: req.body.paymentMethod || "CBE",
      status: "Pending"
    });

    await withdrawal.save();

    res.status(201).json(withdrawal);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

app.put("/withdrawals/:id", async (req, res) => {
  try {
    const withdrawal =
      await Withdrawal.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status
        },
        {
          new: true
        }
      );

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found"
      });
    }

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
