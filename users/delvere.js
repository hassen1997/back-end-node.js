const express = require("express");
const router = express.Router();
const User = require("../modul/Dlevre");
const Delver = require("../modul/Dlevre"); // 🔹 هذا الحل
const sendPinEmail = require("./sendEmailDelvere");

// ================= FETCH (node-fetch) =================
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ================= GET ALL USERS =================
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, _id: 1 }).sort({ createdAt: -1 });
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

  if (!user) return res.json({ success: false, message: "المستخدم غير موجود" });
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
  if (!email) return res.json({ success: false, message: "البريد مطلوب" });

  try {
    await User.findOneAndDelete({ email });
    res.json({ success: true, message: "تم تسجيل الخروج" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ================= SAVE EXPO TOKEN =================
router.post('/save-token', async (req, res) => {
  const { email, token } = req.body;
  try {
    const delver = await Delver.findOne({ email });
    if (!delver) return res.status(404).send({ message: 'المندوب غير موجود' });

    delver.pushToken = token;
    await delver.save();

    res.send({ success: true, message: 'تم حفظ التوكن بنجاح' });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// ==================================================
// 🔥 SEND ORDER TO EXPO (الحل النهائي الصحيح) 🔥
// ==================================================
async function sendPushNotification(pushToken, title, body, order) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: { order },
    }),
  });
}

async function sendOrderToExpo(order) {
  const delvers = await Delver.find({}); // كل المندوبين
  for (const d of delvers) {
    if (d.pushToken) {
      await sendPushNotification(
        d.pushToken,
        'طلب جديد!',
        `لديك طلب جديد من ${order.name} بقيمة ${order.totalPrice} IQD`,
        order
      );
    }
  }
}

// ================= SEND ORDER ROUTE =================
router.post("/send-order-to-expo", async (req, res) => {
  const { email, order } = req.body;
  try {
    await sendOrderToExpo(order);
    res.json({ success: true, message: "تم الإرسال للمندوبين" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "فشل الإرسال" });
  }
});

module.exports = router;
