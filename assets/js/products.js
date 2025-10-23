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
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-first.png",
      // يمكن إضافة المزيد:
      // "assets/products/abaya-with-flowers-2.png",
      // "assets/products/abaya-with-flowers-3.png",
    ],
    description: "عبـايـة بلـون زيتي غامق مائل للسكني ✨",
    tags: ["new","popular"],     // ← يظهر فقط في 'وصل حديثاً'
    rankNew: 1
  },

  {
    id: "ab02",
    title: "عباية سادة — موكا",
    price: 20.00,
    category: "عبايات",
    colors: ["موكا"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-second.png"
    ],
    description: "عباية بني ناعم بتطريز خرز أنيق من الكتف لأسفل ✨",
    tags: ["popular","new"], // ← يظهر فقط في 'الأكثر طلباً'
    rankPopular: 1
  },

  {
    id: "ab03",
    title: "عباية لف — أسود مطفي",
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-3rd.png"
    ],
    description: "ستايل جديد يجمع بين الكلاسيك والعصرية، بلون بني جذاب وقصّة بلايزر فخمة.",
    tags: ["popular"], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },

  // أضيفي المزيد بنفس البنية ↑
];
  {
    id: "ab04",
    title: "عباية لف — أسود مطفي",
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-4th.png"
    ],
    description: "عباية سوداء بنعومة استثنائية، مزينة بوردة جورية من الخرز موزعة بأسلوب راقٍ",
    tags: ["popular"], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },

  // أضيفي المزيد بنفس البنية ↑
];  {
    id: "ab05",
    title: "عباية لف — أسود مطفي",
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-5th.png"
    ],
    description: "✨ عباية بليزر بلون سكني أنيق… قطعة بتجمع بين الرسمية والرقيّ!",
    tags: [], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },

  // أضيفي المزيد بنفس البنية ↑
];  {
    id: "ab06",
    title: "عباية لف — أسود مطفي",
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-6th.png"
    ],
    description: "عباية بيج فخمة بتفاصيل ستراس فضي ناعم يلمع بأناقة!",
    tags: [], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },

  // أضيفي المزيد بنفس البنية ↑
];  {
    id: "ab07",
    title: "عباية لف — أسود مطفي",
    price: 20.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: [
      "price-20-7th.png"
    ],
    description: "عباية إماراتية باللون البني موشحة بالفراشات البرونزية تعكس الاضاءة بسحر أنثوي",
    tags: [], // ← يظهر في القسمين
    rankNew: 2,
    rankPopular: 3
  },


