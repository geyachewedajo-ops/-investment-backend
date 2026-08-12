const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// =========================
// MODELS
// =========================

const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");
const Plan = require("./models/Plan");
const Investment = require("./models/Investment");
const Withdrawal = require("./models/Withdrawal");

// =========================
// ROUTES
// =========================

const investmentRoutes = require("./routes/investments");
const withdrawalRoutes = require("./routes/withdrawals");
const authRoutes = require("./routes/auth");

// =========================
// APP
// =========================

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// =========================
// ROUTE MOUNTS
// =========================

// Authentication
app.use("/auth", authRoutes);

// Investments
app.use("/investments", investmentRoutes);

// Withdrawals
app.use("/withdrawals", withdrawalRoutes);

// =========================
// HOME / HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.status(200).send("💎 Wedajo Investment API Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Investment backend is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// =========================
// PLANS
// =========================

// GET ALL PLANS
app.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find()
      .sort({ createdAt: 1 });

    res.status(200).json(plans);

  } catch (error) {
    console.error("Get plans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load investment plans",
      error: error.message
    });
  }
});

// CREATE PLAN
app.post("/plans", async (req, res) => {
  try {
    const plan = new Plan(req.body);

    const savedPlan = await plan.save();

    res.status(201).json(savedPlan);

  } catch (error) {
    console.error("Create plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create investment plan",
      error: error.message
    });
  }
});

// UPDATE PLAN
app.put("/plans/:id", async (req, res) => {
  try {
    const plan =
      await Plan.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.status(200).json(plan);

  } catch (error) {
    console.error("Update plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message
    });
  }
});

// DELETE PLAN
app.delete("/plans/:id", async (req, res) => {
  try {
    const plan =
      await Plan.findByIdAndDelete(
        req.params.id
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully"
    });

  } catch (error) {
    console.error("Delete plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message
    });
  }
});

// =========================
// INVESTMENT DIRECT ROUTES
// =========================

// GET ALL INVESTMENTS
app.get("/all-investments", async (req, res) => {
  try {
    const investments =
      await Investment.find()
        .sort({ createdAt: -1 });

    res.status(200).json(investments);

  } catch (error) {
    console.error(
      "Get investments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load investments",
      error: error.message
    });
  }
});

// =========================
// PRODUCTS
// =========================

// GET PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products =
      await Product.find();

    res.status(200).json(products);

  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: error.message
    });
  }
});

// CREATE PRODUCT
app.post("/products", async (req, res) => {
  try {
    const product =
      new Product(req.body);

    const savedProduct =
      await product.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
});

// UPDATE PRODUCT
app.put("/products/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
});

// DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
});

// =========================
// ORDERS
// =========================

// GET ORDERS
app.get("/orders", async (req, res) => {
  try {
    const orders =
      await Order.find()
        .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load orders",
      error: error.message
    });
  }
});

// CREATE ORDER
app.post("/orders", async (req, res) => {
  try {
    const order =
      new Order(req.body);

    const savedOrder =
      await order.save();

    res.status(201).json(savedOrder);

  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
});

// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error(
    "SERVER ERROR:",
    err
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

// =========================
// DATABASE
// =========================

const MONGO_URI =
  process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "❌ MONGO_URI is missing from environment variables."
  );
} else {

  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(
        "✅ MongoDB Connected"
      );
    })
    .catch((error) => {
      console.error(
        "❌ MongoDB Error:",
        error.message
      );
    });
}

// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});
