const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, unique: true },
  referredBy: { type: String }, // the referralCode of the referrer
  stripeCustomerId: { type: String }, // for subscriptions
  subscriptionStatus: { type: String, default: "inactive" }, // active/inactive
  subscriptionPlan: { type: String }, // plan ID (basic, standard, etc.)
  trialEndsAt: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
