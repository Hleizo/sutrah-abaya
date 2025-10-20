window.PRODUCTS = [
  {
    id: "ab01",
    title: "عباية مطرزة ورود — أسود",
    price: 89.00,
    category: "عبايات",
    colors: ["أسود"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "عباية سوداء بتطريز ورود...",
    // NEW ↓↓↓
    tags: ["new"],   // show in both sections
    rankNew: 1,                 // lower = earlier in "new"
    rankPopular: 2              // lower = earlier in "popular"
  },
  {
    id: "ab02",
    title: "عباية سادة — موكا",
    price: 79.00,
    category: "عبايات",
    colors: ["موكا"],
    sizes: ["S","M","L","XL"],
    images: ["assets/products/abaya-with-flowers.png"],
    description: "قماش ناعم وانسيابي...",
    // NEW ↓↓↓
    tags: ["popular"],          // only in "popular"
    rankPopular: 1
  },
  // ...
];
