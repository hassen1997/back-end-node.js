const express = require("express");
const Order = require("../modul/Order");
const { sendOrderToExpo } = require("../users/delvere"); // 🔹 استدعاء الدالة من ملف delvere.js

const router = express.Router();

// ================= SAVE ORDER =================
// (الكود الموجود بدون أي تغيير)
router.post("/create", async (req, res) => {
  try {
    const { email, phone, location, items, totalPrice, name } = req.body;

    if (!email || !phone || !location || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "بيانات الطلب ناقصة",
      });
    }

    // 🔍 طلب سابق لنفس المستخدم
    let order = await Order.findOne({ email, phone });

    if (order) {
        if (name) order.name = name;
        console.log("NAME FROM BODY:", name);

      items.forEach((newItem) => {
        const existingItem = order.items.find(
          (item) =>
            item.productId === newItem.productId &&
            item.image === newItem.image
        );

        if (existingItem) {
          // ✅ فقط زيادة الكمية (بدون حساب السعر)
          existingItem.quantity = newItem.quantity;
        } else {
          // ✅ إضافة المنتج كما هو من التطبيق
          order.items.push(newItem);
        }
      });

      // ✅ استبدال السعر الكلي كما وصل من التطبيق
      order.totalPrice = totalPrice;

      await order.save();

      return res.json({
        success: true,
        message: "تم تحديث الطلب بدون أخطاء حساب",
      });
    }

    // 🆕 طلب جديد
    const newOrder = new Order({
      name,
      email,
      phone,
      location,
      items,
      totalPrice,
    });

    await newOrder.save();

    res.json({
      success: true,
      message: "تم حفظ الطلب بنجاح",
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "خطأ في السيرفر",
    });
  }
});

// ================= GET FULL ORDER =================
// ================= GET ALL ORDERS =================
router.get("/all", async (req, res) => {
  try {
    // جلب كل الطلبات من الداتا بيس
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.json({
        success: false,
        message: "لا توجد طلبات في قاعدة البيانات",
        orders: [],
      });
    }

    // إعادة كل البيانات كما هي بدون حذف أي شيء
    res.json({
      success: true,
      message: "تم جلب جميع الطلبات بنجاح",
      orders, // كل الطلبات مع: email, phone, location, totalPrice, items (title, image, price, quantity, productId)
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "خطأ في السيرفر أثناء جلب الطلبات",
    });
  }
});



module.exports = router;
