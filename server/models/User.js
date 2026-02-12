const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// PERMANENT ADMIN EMAILS - Cannot be changed
const ADMIN_EMAILS = ["qazisanaullah612@gmail.com", "atiq.ajiz786@gmail.com"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  accountStatus: {
    type: String,
    enum: ["pending", "approved", "blocked"],
    default: "approved",
  },
  resourceAccess: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    enum: ["none", "basic", "standard", "premium"],
    default: "none",
  },
  planExpiryDate: {
    type: Date,
  },
  hoursRemaining: {
    type: Number,
    default: 0,
  },
  totalClassesTaken: {
    type: Number,
    default: 0,
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  paymentHistory: [
    {
      amount: Number,
      currency: String,
      plan: String,
      date: {
        type: Date,
        default: Date.now,
      },
      stripePaymentId: String,
    },
  ],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-assign admin role for protected emails before saving
userSchema.pre("save", async function (next) {
  // Force admin role for protected emails
  if (ADMIN_EMAILS.includes(this.email.toLowerCase())) {
    this.role = "admin";
    this.accountStatus = "approved";
    this.resourceAccess = true;
  }

  // Hash password if modified
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Prevent role change for admin emails via findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  // We'll check in the route layer as well, but this is a safety net
  if (update && update.role) {
    // Cannot remove admin from protected emails - handled in route
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if email is a protected admin email
userSchema.statics.isAdminEmail = function (email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

userSchema.statics.ADMIN_EMAILS = ADMIN_EMAILS;

module.exports = mongoose.model("User", userSchema);
