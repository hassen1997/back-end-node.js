const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number },
  category: { type: String, enum: ["meat", "chicken", "drinks", "Offers", "waters"] },
  quantityAvailable: { type: Number, required: true }, // ✅ إضافة الكمية فقط

  image: { type: String },
});

module.exports = mongoose.model("Product", ProductSchema);
