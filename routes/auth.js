const express = require("express");
const router = express.Router();

const User = require("../models/User");

// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim() },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.trim(),
      password,
      role: role || "customer",
    });

    await user.save();

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
      password,
    });

    console.log("LOGIN USER:", user);
    console.log(
      "LOGIN ROLE:",
      user ? user.role : "NO USER"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================
// CHANGE PASSWORD
// =========================
router.put("/change-password", async (req, res) => {
  try {
    const {
      username,
      currentPassword,
      newPassword,
    } = req.body;

    // Check fields
    if (
      !username ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // Prevent using same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    console.log(
      "CHANGE PASSWORD REQUEST:",
      username
    );

    // =================================================
    // IMPORTANT:
    // Find AND update in one MongoDB operation.
    // This works for both customer and admin.
    // =================================================

    const updatedUser =
      await User.findOneAndUpdate(
        {
          username: username.trim(),
          password: currentPassword,
        },
        {
          $set: {
            password: newPassword,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // User/password combination not found
    if (!updatedUser) {
      // Check whether username exists
      const userExists = await User.findOne({
        username: username.trim(),
      });

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Username not found",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    console.log(
      "PASSWORD CHANGED SUCCESSFULLY:",
      updatedUser.username,
      "ROLE:",
      updatedUser.role
    );

    res.json({
      success: true,
      message: "Password changed successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =========================
// EXPORT
// =========================
module.exports = router;
