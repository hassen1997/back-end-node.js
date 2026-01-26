// server.js
const express = require("express");
const admin = require("firebase-admin");


const route = express.Router()



let expoToken = null;

// استقبال التوكن من التطبيق
route.post("/save-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token مفقود" });
  }

  expoToken = token;
  console.log("✅ Expo Token Saved:", token);

  res.json({ success: true });
});

// إرسال إشعار تجربة (طلب جديد)
route.post("/send-test-order", async (req, res) => {
  if (!expoToken) {
    return res.status(400).json({ message: "لا يوجد Token" });
  }

  const message = {
    to: expoToken,
    sound: "default",
    title: "📦 طلب جديد",
    body: "لديك طلب جديد، اضغط للمشاهدة",
    data: {
      order: {
        name: "أحمد علي",
        phone: "07701234567",
        location: "بغداد - الكرادة",
        totalPrice: 45000,
        items: [
          {
            _id: "1",
            title: "هاتف سامسونگ",
            quantity: 1,
            price: 35000,
            image:
              "https://via.placeholder.com/300x200.png?text=Samsung+Phone",
          },
          {
            _id: "2",
            title: "سماعة بلوتوث",
            quantity: 2,
            price: 5000,
            image:
              "https://via.placeholder.com/300x200.png?text=Headphone",
          },
        ],
      },
    },
  };

  try {
    const response = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      }
    );

    const result = await response.json();
    console.log("🚀 Notification Sent:", result);

    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false });
  }
});
module.exports = route

