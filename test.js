// server.js
const express = require("express");
const admin = require("firebase-admin");


const route = express.Router()



const expoUsers = {}; // لتخزين توكنات Expo مؤقتًا

// حفظ توكن
route.post("/save-token", (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ message: "مفقود" });

  expoUsers[email] = token;
  console.log(`📌 حفظ التوكن: ${token} للمستخدم: ${email}`);
  res.json({ success: true });
});

// إرسال إشعار تجريبي
route.post("/send-notification", async (req, res) => {
  const { email } = req.body;

  const token = expoUsers[email];
  if (!token) return res.status(400).json({ message: "لا يوجد توكن" });

  const message = {
    to: token,
    sound: "default",
    title: "📦 إشعار تجريبي",
    body: "هذا إشعار تجريبي من السيرفر",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    console.log("🚀 تم الإرسال:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.log("❌ خطأ في الإرسال:", err);
    res.status(500).json({ success: false });
  }
});
module.exports = route

