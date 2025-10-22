/* ===== Sutrah — Products =====
   Use tags to control Home sections:
   - tags: ["new"]       -> shows in "وصل حديثاً"
   - tags: ["popular"]   -> shows in "الأكثر طلباً"
   - tags: ["new","popular"] -> shows in both
   - tags: [] or remove  -> shows in neither section (still in Shop)
   Order inside a section is by rankNew / rankPopular (smaller = earlier).
*/

window.PRODUCTS = [
  {
    id: "ab01",
    title: "عباية مطرزة ورود — أسود",
    price: 89.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "عباية سوداء بتطريز ورود ناعم وخياطة نظيفة. مناسبة للجامعة والدوام والمناسبات.",
    tags: ["new""],
    rankNew: 1,
    rankPopular: 2
  },
  {
    id: "ab02",
    title: "عباية سادة — موكا",
    price: 79.00,
    category: "عبايات",
    colors: ["موكا"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "قماش ناعم وانسيابي للاستخدام اليومي المريح.",
    tags: [""],
    rankPopular: 1
  },
  {
    id: "ab03",
    title: "عباية لف — أسود مطفي",
    price: 84.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "تصميم لف عملي مع قصة محافظة وانسيابية.",
    tags: ["new"],
    rankNew: 2
  },
  {
    id: "ab04",
    title: "طقم عباءة مع شيلة — كريمي",
    price: 95.00,
    category: "أطقم",
    colors: ["كريمي"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "طقم كامل مناسب للمناسبات والخروج الراقي.",
    tags: [],           // hidden from both home sections
    // no ranks needed
  }
];
