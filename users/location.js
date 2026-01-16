const express = require("express");
const User = require("../modul/User");

const router = express.Router();

// SAVE PHONE & LOCATION
router.post("/save-info", async (req, res) => {
  try {
    const { email, phone, location } = req.body;

    if (!email || !phone || !location) {
      return res.json({ success: false, message: "البيانات ناقصة" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "المستخدم غير موجود" });
    }

    if (!user.verified) {
      return res.json({ success: false, message: "الحساب غير موثّق" });
    }

    user.phone = phone;
    user.location = location;

    await user.save();

    res.json({ success: true, message: "تم حفظ المعلومات بنجاح" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

module.exports = router;
