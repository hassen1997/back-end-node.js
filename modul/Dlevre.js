const mongoose = require("mongoose")

const DelverSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    pushToken: String, // 🔹 مهم لإرسال الإشعار
    pin: String,
    pinExpires: Date,
    verified: { type: Boolean, default: false },
  
})

module.exports = mongoose.model("Delvre", DelverSchema)