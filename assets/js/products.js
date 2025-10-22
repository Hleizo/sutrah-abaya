/* ===== Sutrah — Products =====
   Use tags to control Home sections:
   - tags: ["new"]       -> shows in "وصل حديثاً"
   - tags: ["popular"]   -> shows in "الأكثر طلباً"
   - tags: ["new","popular"] -> shows in both
   - tags: [] or remove  -> shows in neither section (still in Shop)
   Order inside a section is by rankNew / rankPopular (smaller = earlier).
*/

/* بيانات المنتجات — سترة
   ملاحظات مهمة:
   - لتغيير مكان ظهور المنتج على الصفحة الرئيسية، عدّلي الحقل "tags".
   - لإضافة أكثر من صورة لمنتج ما، ضيفي أكثر من مسار داخل مصفوفة images.
   - رتّبي الظهور داخل كل قسم بواسطة rankPopular / rankNew (اختياري).
*/

window.PRODUCTS = [
  {
    id: "ab01",
    title: "عباية مطرزة ورود — أسود",
    price: 89.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "assets/products/abaya-with-flowers.png",
      // يمكن إضافة المزيد:
      // "assets/products/abaya-with-flowers-2.png",
      // "assets/products/abaya-with-flowers-3.png",
    ],
    description: "عباية سوداء بتطريز ورود ناعم وخياطة نظيفة. مناسبة للجامعة والدوام والمناسبات.",
    tags: ["new"],     // ← يظهر فقط في 'وصل حديثاً'
    rankNew: 1
  },

  {
    id: "ab02",
    title: "عباية سادة — موكا",
    price: 79.00,
    category: "عبايات",
    colors: ["موكا"],
    sizes: ["S","M","L","XL"],
    images: [
      "assets/products/abaya-mocha.png"
    ],
    description: "قماش ناعم وانسيابي للاستخدام اليومي المريح.",
    tags: ["popular"], // ← يظهر فقط في 'الأكثر طلباً'
    rankPopular: 1
  },

  {
    id: "ab03",
    title: "عباية لف — أسود مطفي",
    price: 84.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "assets/products/abaya-matte.png"
    ],
    description: "موديل لف عملي ومريح.",
    tags: ["new","popular"], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },

  // أضيفي المزيد بنفس البنية ↑
];
