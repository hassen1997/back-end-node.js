const express = require("express");
const User = require("../modul/Dlevre");
const sendPinEmail = require("./sendEmailDelvere");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();

// ================= GET ALL USERS =================
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, _id: 1 })
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في جلب المستخدمين" });
  }
});

// ================= REGISTER =================
router.post("/re", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.json({ success: false, message: "البيانات ناقصة" });

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpires = new Date(Date.now() + 10 * 60 * 1000);

    await sendPinEmail(email, pin);

    let user = await User.findOne({ email });
    if (user) {
      user.pin = pin;
      user.pinExpires = pinExpires;
      user.verified = false;
    } else {
      user = new User({ name, email, pin, pinExpires });
    }

    await user.save();
    res.json({ success: true, message: "تم إرسال رمز التحقق" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "فشل إرسال الإيميل" });
  }
});

// ================= VERIFY =================
router.post("/ve", async (req, res) => {
  const { email, pin } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return res.json({ success: false, message: "المستخدم غير موجود" });

  if (user.pin !== pin || user.pinExpires < new Date())
    return res.json({ success: false, message: "رمز غير صحيح أو منتهي" });

  user.verified = true;
  user.pin = null;
  user.pinExpires = null;
  await user.save();

  res.json({ success: true, message: "تم التحقق بنجاح" });
});

// ================= LOGOUT =================
router.post("/log", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.json({ success: false, message: "البريد مطلوب" });

  try {
    await User.findOneAndDelete({ email });
    res.json({ success: true, message: "تم تسجيل الخروج" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ================= SAVE TOKEN =================
router.post("/save-token", async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token)
    return res.json({ success: false, message: "مفقود" });

  const user = await User.findOne({ email });
  if (!user)
    return res.json({ success: false, message: "المستخدم غير موجود" });

  user.pushToken = token;
  await user.save();

  res.json({ success: true, message: "تم حفظ التوكن" });
});

// ==================================================
// 🔥🔥🔥 هذا هو الحل الحقيقي بدون تغيير أي كود عندك 🔥🔥🔥
// ==================================================
router.post("/send-order-to-expo", async (req, res) => {
  const { email, order } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.pushToken)
    return res.json({ success: false, message: "لا يوجد push token" });

  const message = {
    to: user.pushToken,
    sound: "default",
    title: "📦 طلب جديد",
    body: `عدد المنتجات: ${order.items.length} | السعر: ${order.totalPrice} IQD`,
    data: {
      orderDetails: order,
    },
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("Expo response:", result);

    res.json({ success: true, message: "تم إرسال الإشعار" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "فشل الإرسال" });
  }
});

module.exports = router;
