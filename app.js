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
const delvreRoutes = require("./users/delvere");

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// 6️⃣ الملفات الثابتة
// ------------------------
app.use("/uploads", express.static("uploads"));
app.use("/uplodhome", express.static("uplodhome"));

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

// Route أساسي لتأكيد تشغيل السيرفر
app.get("/", (req, res) => res.send("Server is running"));

// ------------------------
// 8️⃣ اتصال MongoDB
// ------------------------
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; // لمنع الاتصال المزدوج
  try {
    await mongoose.connect(process.env.MONGO_URI); // ضع URI في .env
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
};
connectDB();

// ------------------------
// 9️⃣ تشغيل السيرفر
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
