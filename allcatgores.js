const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const Product = require("./modul/djaj");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// إعداد multer لتخزين الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// =================================
// GET جميع المنتجات أو حسب الفئة
// =================================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// =================================
// POST منتج جديد
// =================================
router.post("/", upload.single("image"), async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    image: req.file ? `/uploads/${req.file.filename}` : "",
  });

  await product.save();
  res.status(201).json(product);
});

// =================================
// GET منتج بالـ id
// =================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================
// PUT تحديث منتج
// =================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // حذف الصورة القديمة
    if (req.file && product.image) {
      const oldImagePath = path.join(__dirname, "../", product.image);
      fs.unlink(oldImagePath, (err) => { if (err) console.log(err); });
    }

    product.title = req.body.title || product.title;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================
// DELETE منتج
// =================================
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      const imagePath = path.join(__dirname, "../", product.image);
      fs.unlink(imagePath, (err) => { if (err) console.log(err); });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================
// Validation باستخدام Joi
// =================================
function validateProduct(obj) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    price: Joi.number(),
    category: Joi.string().valid("meat", "chicken", "drinks","Offers","waters"),
    image: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = router;
