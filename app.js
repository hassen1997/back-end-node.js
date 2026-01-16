// ------------------------
// 1️⃣ استدعاء المكتبات
// ------------------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// ------------------------
// 2️⃣ استدعاء Routes
// ------------------------
const productRoute = require("./route/product");
const home = require("./home/home");
const allcatgores = require("./allcatgores");
const authRoutes = require("./users/auth");
const locationRoutes = require("./users/location");
const orderRoutes = require("./route/order");
const delvreRoutes = require("./users/delvere")
// ------------------------
// 3️⃣ إعداد البيئة
// ------------------------
require("dotenv").config();

// ------------------------
// 4️⃣ إنشاء التطبيق
// ------------------------
const app = express();

// ------------------------
// 5️⃣ Middlewares
// ------------------------
app.use(cors());
app.use(express.json()); // لتحليل JSON
app.use(express.urlencoded({ extended: true })); // لتحليل form-data

// ------------------------
// 6️⃣ إعداد الملفات الثابتة
// ------------------------
app.use("/uploads", express.static("uploads"));       // منتجات الغذائية
app.use("/uplodhome", express.static("uplodhome"));   // صور الصفحة الرئيسية

// ------------------------
// 7️⃣ Routes
// ------------------------
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoute);
app.use("/api/all", allcatgores);
app.use("/api/home", home);
app.use("/api/user", locationRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/delver", delvreRoutes);


// ------------------------
// 8️⃣ اتصال MongoDB
// ------------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/testdb")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ------------------------
// 9️⃣ تشغيل السيرفر
// ------------------------
app.listen(5000,  () => {
  console.log("🚀 Server running on port 5000");
});
