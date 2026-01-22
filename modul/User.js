const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,        // ✅ رقم الهاتف
  location: String,     // ✅ الموقع (lat,long أو نص)
  pin: String,
  pinExpires: Date,
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
