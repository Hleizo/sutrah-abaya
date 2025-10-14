/* Sutrah Abaya — Arabic SPA (RTL)
   - صفحات: الرئيسية، المتجر، المنتج، السلة، الدفع، من نحن، التوصيل لفلسطين، السياسات، تواصل
   - دفع عبر واتساب: يرسل تفاصيل الطلب إلى +962 79 517 8746
*/

(() => {
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  const app = $("#app");
  const toast = $("#toast");
  const cartCount = $("#cart-count");

  const PHONE_E164 = "962795178746";         // بدون +
  const PHONE_READ = "+962 79 517 8746";

  const state = {
    cart: load("cart", []),                   // [{id, size, color, qty}]
    filters: { q:"", cat:"الكل", sort:"popular" }
  };

  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function load(k, f){ try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch{ return f } }
  function money(n){ return "د.أ " + n.toFixed(2); }

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(()=> toast.classList.remove("show"), 2500);
  }

  // Footer year + newsletter
  (function() {
    const y = $("#year"); if(y) y.textContent = new Date().getFullYear();
    const nf = $("#newsletter-form");
    if(nf) nf.addEventListener("submit", e => { e.preventDefault(); showToast("تم الاشتراك بنجاح ✨"); e.target.reset(); });
  })();

  // Reveal on scroll
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=> e.isIntersecting && e.target.classList.add("in"));
  }, {threshold: .12});
  const withReveal = el => { el.classList.add("reveal"); io.observe(el); return el; };

  // ====== CART ======
  const keyOf = it => `${it.id}-${it.size||'NA'}-${it.color||'NA'}`;
  const getCartQty = () => state.cart.reduce((a,i)=>a + Number(i.qty||0), 0);
  function updateCartCount(){ cartCount.textContent = getCartQty(); }
  updateCartCount();

  function addToCart(item){
    const k = keyOf(item);
    const ex = state.cart.find(i=> keyOf(i)===k);
    if(ex){ ex.qty += item.qty || 1; }
    else state.cart.push({ ...item, qty: item.qty || 1 });
    save("cart", state.cart); updateCartCount(); showToast("أُضيفت للسلة");
  }
  function removeFromCart(i){ state.cart.splice(i,1); save("cart", state.cart); updateCartCount(); render(); }
  function changeQty(i, qty){ state.cart[i].qty = Math.max(1, qty|0); save("cart", state.cart); updateCartCount(); render(); }

  // ====== ROUTER ======
  const routes = {
    "/": viewHome,
    "/shop": viewShop,
    "/product/:id": viewProduct,
    "/cart": viewCart,
    "/checkout": viewCheckout,
    "/about": viewAbout,
    "/delivery-palestine": viewDeliveryPS,
    "/policy/:slug": viewPolicy,
    "/contact": viewContact
  };

  function parseHash(){
    const cur = location.hash.replace(/^#/, "") || "/";
    const parts = cur.split("?")[0].split("/").filter(Boolean);
    return { path: "/" + parts.join("/"), segments: parts };
  }
  function matchRoute(){
    const { segments } = parseHash();
    for(const pattern in routes){
      const p = pattern.split("/").filter(Boolean);
      if(p.length !== segments.length) continue;
      let params = {};
      let ok = p.every((seg, i)=>{
        if(seg.startsWith(":")){ params[seg.slice(1)] = decodeURIComponent(segments[i]); return true; }
        return seg === segments[i];
      });
      if(ok) return { view: routes[pattern], params };
    }
    return { view: routes["/"], params:{} };
  }
  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);

  // ====== VIEWS ======

  function viewHome(){
    app.innerHTML = `
      <section class="hero floaters">
        <div>
          <span class="pill">جديدنا • New</span>
          <h1>سترة — أناقتكِ في سترك</h1>
          <p>عبايات عملية ومناسبة لكل طلّة: جامعة، دوام، مناسبة. التوصيل داخل الأردن وفلسطين.</p>
          <div class="cta">
            <a class="btn btn-primary" href="#/shop">تسوّقي الآن</a>
            <a class="btn" href="#/contact">تواصلي عبر واتساب</a>
          </div>
        </div>
        <div aria-hidden="true">
          <img src="${PRODUCTS[0].images[0]}" alt="" style="border-radius:16px; box-shadow:var(--shadow)">
        </div>
      </section>

      <section class="section">
        <h2>الأكثر طلباً</h2>
        <p class="lead">اختيارات زبوناتنا المفضّلة.</p>
        <div class="grid" id="home-trending"></div>
      </section>

      <section class="section">
        <h2>وصل حديثاً</h2>
        <p class="lead">تصاميم جديدة بكمّيات محدودة.</p>
        <div class="grid" id="home-new"></div>
      </section>
    `;
    const t = $("#home-trending"), n = $("#home-new");
    PRODUCTS.slice(0,3).forEach(p=> t.append(productCard(p)));
    PRODUCTS.slice().reverse().forEach(p=> n.append(productCard(p)));
    $$(".section").forEach(withReveal);
  }

  function productCard(p){
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <a href="#/product/${encodeURIComponent(p.id)}" class="media" aria-label="${p.title}">
        <img loading="lazy" src="${p.images[0]}" alt="${p.title}" />
      </a>
      <div class="info">
        <div class="muted">${p.category}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <h3 style="margin:.2rem 0;font-size:1.05rem">${p.title}</h3>
          <div class="price">${money(p.price)}</div>
        </div>
        <div style="display:flex;gap:8px; flex-wrap:wrap">
          <button class="btn" data-quick="${p.id}">إضافة سريعة</button>
          <a class="btn btn-primary" href="#/product/${encodeURIComponent(p.id)}">التفاصيل</a>
        </div>
      </div>
    `;
    el.querySelector('[data-quick]').addEventListener('click', ()=>{
      addToCart({ id:p.id, size:p.sizes[0], color:p.colors[0], qty:1 });
    });
    return withReveal(el);
  }

  function viewShop(){
    app.innerHTML = `
      <section class="section">
        <h2>المتجر</h2>
        <p class="lead">فلترة وبحث وترتيب — اختاري ما يناسبكِ.</p>
        <div class="toolbar">
          <input id="q" type="search" placeholder="ابحثي عن منتج..." value="${state.filters.q}">
          <select id="cat">
            ${["الكل","عبايات","أطقم"].map(c=>`<option ${state.filters.cat===c?"selected":""}>${c}</option>`).join("")}
          </select>
          <select id="sort">
            <option value="popular" ${state.filters.sort==="popular"?"selected":""}>الأشهر</option>
            <option value="low" ${state.filters.sort==="low"?"selected":""}>السعر: من الأقل</option>
            <option value="high" ${state.filters.sort==="high"?"selected":""}>السعر: من الأعلى</option>
            <option value="new" ${state.filters.sort==="new"?"selected":""}>الأحدث</option>
          </select>
        </div>
        <div class="grid" id="shop-grid" style="margin-top:14px"></div>
      </section>
    `;
    $("#q").addEventListener("input", (e)=>{ state.filters.q = e.target.value.trim(); renderShopGrid(); });
    $("#cat").addEventListener("change",(e)=>{ state.filters.cat = e.target.value; renderShopGrid(); });
    $("#sort").addEventListener("change",(e)=>{ state.filters.sort = e.target.value; renderShopGrid(); });
    renderShopGrid();
  }

  function renderShopGrid(){
    const g = $("#shop-grid");
    const { q, cat, sort } = state.filters;
    let items = PRODUCTS.filter(p=>{
      const okCat = cat==="الكل" || p.category===cat;
      const okQ = !q || (p.title.includes(q) || p.description.includes(q));
      return okCat && okQ;
    });
    if(sort==="low") items.sort((a,b)=> a.price - b.price);
    if(sort==="high") items.sort((a,b)=> b.price - a.price);
    if(sort==="new") items = items.slice().reverse();
    g.innerHTML = ""; items.forEach(p=> g.append(productCard(p)));
  }

  function viewProduct({ id }){
    const p = PRODUCTS.find(x=> x.id === id);
    if(!p){ app.innerHTML = `<section class="section"><p>المنتج غير موجود.</p></section>`; return; }

    app.innerHTML = `
      <section class="product section">
        <div class="gallery">
          <div class="main"><img id="main-img" src="${p.images[0]}" alt="${p.title}"></div>
          <div class="thumbs">
            ${p.images.map((src,i)=>`<img data-src="${src}" alt="صورة ${i+1} - ${p.title}" ${i===0?'style="outline:2px solid var(--rose)"':''} />`).join("")}
          </div>
        </div>
        <div class="details">
          <div class="pill">${p.category}</div>
          <h1 style="margin:.5rem 0 0">${p.title}</h1>
          <p class="muted">${p.description}</p>
          <h3 class="price" style="margin:.2rem 0 10px">${money(p.price)}</h3>

          <div class="options">
            <div>
              <div class="muted" style="margin-bottom:6px">اللون</div>
              <div class="swatches" id="color-sw">
                ${p.colors.map((c,i)=>`<button class="swatch" aria-pressed="${i===0?'true':'false'}">${c}</button>`).join("")}
              </div>
            </div>
            <div>
              <div class="muted" style="margin-bottom:6px">المقاس</div>
              <div class="sizes" id="size-sw">
                ${p.sizes.map((s,i)=>`<button class="size" aria-pressed="${i===0?'true':'false'}">${s}</button>`).join("")}
              </div>
            </div>
            <div class="qty">
              <label for="qty" class="muted">الكمية</label>
              <input id="qty" type="number" min="1" value="1" />
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button id="add" class="btn btn-primary">أضف للسلة</button>
              <a class="btn" href="#/cart">الذهاب للسلة</a>
            </div>
          </div>
        </div>
      </section>
    `;
    $$(".thumbs img").forEach(img=>{
      img.addEventListener("click", ()=>{
        $("#main-img").src = img.dataset.src;
        $$(".thumbs img").forEach(x=> x.style.outline="none");
        img.style.outline = "2px solid var(--rose)";
      })
    });
    $("#color-sw").addEventListener("click", (e)=>{
      if(e.target.classList.contains("swatch")){
        $$("#color-sw .swatch").forEach(b=> b.setAttribute("aria-pressed","false"));
        e.target.setAttribute("aria-pressed","true");
      }
    });
    $("#size-sw").addEventListener("click", (e)=>{
      if(e.target.classList.contains("size")){
        $$("#size-sw .size").forEach(b=> b.setAttribute("aria-pressed","false"));
        e.target.setAttribute("aria-pressed","true");
      }
    });
    $("#add").addEventListener("click", ()=>{
      const c = $("#color-sw .swatch[aria-pressed='true']").textContent;
      const s = $("#size-sw .size[aria-pressed='true']").textContent;
      const q = parseInt($("#qty").value || "1", 10);
      addToCart({ id: p.id, color: c, size: s, qty: q });
    });
    withReveal($(".product"));
  }

  function viewCart(){
    const items = state.cart.map(ci => {
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"غير معروف", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = items.length ? 3.00 : 0;
    const total = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>سلتك</h2>
        ${!items.length ? `<p class="lead">السلة فارغة. <a class="btn" href="#/shop">ابدئي التسوّق</a></p>` : `
          <div style="overflow:auto">
            <table class="table">
              <thead>
                <tr><th>المنتج</th><th>الخيارات</th><th>الكمية</th><th>المجموع</th><th></th></tr>
              </thead>
              <tbody>
                ${items.map((it, i)=>`
                  <tr>
                    <td style="display:flex; gap:10px; align-items:center">
                      <img src="${it.prod.images[0]}" alt="">
                      <div>
                        <div style="font-weight:700">${it.prod.title}</div>
                        <small class="muted">${it.id}</small>
                      </div>
                    </td>
                    <td>${it.color || "-"} / ${it.size || "-"}</td>
                    <td><input type="number" min="1" value="${it.qty}" data-qty="${i}" style="width:76px"></td>
                    <td>${money(it.line)}</td>
                    <td><button class="btn" data-rm="${i}" aria-label="إزالة">إزالة</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div style="display:flex; gap:16px; margin-top:12px; flex-wrap:wrap; align-items:flex-start">
            <div class="pill">عندك سؤال؟ <a href="https://wa.me/${PHONE_E164}" target="_blank">راسِلينا واتساب</a></div>
            <div class="right" style="margin-inline-start:auto; min-width:260px">
              <div style="display:flex; justify-content:space-between"><span class="muted">الإجمالي الفرعي</span><strong>${money(subtotal)}</strong></div>
              <div style="display:flex; justify-content:space-between"><span class="muted">الشحن</span><strong>${money(shipping)}</strong></div>
              <div style="display:flex; justify-content:space-between; font-size:1.2rem; margin-top:6px"><span>الإجمالي</span><strong>${money(total)}</strong></div>
              <a class="btn btn-primary" style="width:100%; margin-top:10px" href="#/checkout">إتمام الطلب</a>
            </div>
          </div>
        `}
      </section>
    `;
    $$("button[data-rm]").forEach(b=> b.addEventListener("click", ()=> removeFromCart(parseInt(b.dataset.rm,10))));
    $$("input[data-qty]").forEach(inp=> inp.addEventListener("change", ()=> changeQty(parseInt(inp.dataset.qty,10), parseInt(inp.value||"1",10))));
  }

  // ====== CHECKOUT (WhatsApp + Google Maps embed) ======
  function viewCheckout(){
    const items = state.cart.map(ci => {
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"غير معروف", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    if(!items.length){ location.hash = "#/cart"; return; }

    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = 3.00;
    const total = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>إتمام الطلب</h2>
        <div class="checkout">
          <form id="co" class="check-card">
            <div class="step">١ • بيانات الشحن</div>
            <div class="form-row" style="margin-top:8px">
              <input name="name" placeholder="الاسم الكامل" required />
              <input name="phone" placeholder="الهاتف" value="${PHONE_READ}" required />
            </div>
            <div class="form-row">
              <input id="addr" name="address" placeholder="العنوان (المدينة، الشارع، المبنى)" required />
            </div>
            <div class="form-row">
              <button id="open-maps" class="btn" type="button" title="فتح في خرائط جوجل">فتح الخريطة</button>
              <button id="myloc" class="btn" type="button" title="استخدام موقعي">استخدمي موقعي</button>
            </div>
            <div class="mapbox">
              <iframe id="gmap" loading="lazy"
                src="https://www.google.com/maps?q=Amman%20Jordan&output=embed"
                allowfullscreen></iframe>
            </div>

            <div class="step" style="margin-top:12px">٢ • ملاحظات</div>
            <div class="form-row">
              <textarea name="note" rows="3" placeholder="ملاحظة للطلب (اختياري)"></textarea>
            </div>

            <div class="form-row" style="margin-top:10px">
              <button class="btn btn-primary" type="submit">تأكيد الطلب</button>
              <a id="wa-btn" class="whats-btn" href="#" target="_blank" rel="noopener">الدفع عبر واتساب</a>
            </div>
            <small class="muted">سيتم إرسال تفاصيل طلبك مباشرة إلى واتساب سترة لإتمام التأكيد.</small>
          </form>

          <div class="check-card">
            <div class="step">ملخّص الطلب</div>
            <table class="table" style="margin-top:6px">
              <tbody>
                ${items.map(it=>`
                  <tr>
                    <td style="display:flex; gap:10px; align-items:center">
                      <img src="${it.prod.images[0]}" alt="">
                      <div>
                        <div style="font-weight:700">${it.prod.title}</div>
                        <small class="muted">${it.color || "-"} / ${it.size || "-"}</small>
                      </div>
                    </td>
                    <td style="text-align:end">${money(it.line)}</td>
                  </tr>`).join("")}
                <tr><td class="muted">الإجمالي الفرعي</td><td style="text-align:end">${money(subtotal)}</td></tr>
                <tr><td class="muted">الشحن</td><td style="text-align:end">${money(shipping)}</td></tr>
                <tr><td><strong>الإجمالي</strong></td><td style="text-align:end"><strong>${money(total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    const addr = $("#addr");
    const gmap = $("#gmap");
    const waBtn = $("#wa-btn");
    let lastCoords = null;

    function updateMap(q){
      const url = "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
      gmap.src = url;
    }
    function buildWhatsAppLink(form){
      // Compose order text in Arabic
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const address = form.address.value.trim();
      const note = (form.note.value || "").trim();

      const lines = [];
      lines.push("طلب جديد من موقع سترة ✨");
      lines.push(`الاسم: ${name}`);
      lines.push(`الهاتف: ${phone}`);
      lines.push(`العنوان: ${address}`);
      if(lastCoords){ lines.push(`الموقع GPS: ${lastCoords.latitude.toFixed(5)}, ${lastCoords.longitude.toFixed(5)}`); }
      if(note) lines.push(`ملاحظة: ${note}`);
      lines.push("");
      lines.push("المنتجات:");
      state.cart.forEach(ci=>{
        const p = PRODUCTS.find(pp=> pp.id===ci.id);
        if(!p) return;
        lines.push(`• ${p.title} — لون: ${ci.color || "-"}، مقاس: ${ci.size || "-"} × ${ci.qty}`);
      });
      const subtotal = state.cart.reduce((a,ci)=> {
        const p = PRODUCTS.find(pp=> pp.id===ci.id); return a + (p?p.price:0)*ci.qty;
      }, 0);
      const shipping = state.cart.length ? 3.00 : 0;
      lines.push("");
      lines.push(`الإجمالي الفرعي: ${money(subtotal)}`);
      lines.push(`الشحن: ${money(shipping)}`);
      lines.push(`الإجمالي: ${money(subtotal + shipping)}`);

      const text = encodeURIComponent(lines.join("\n"));
      return `https://wa.me/${PHONE_E164}?text=${text}`;
    }

    $("#open-maps").addEventListener("click", ()=>{
      const q = addr.value.trim() || "Amman Jordan";
      window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q), "_blank");
    });

    addr.addEventListener("change", ()=> updateMap(addr.value));

    $("#myloc").addEventListener("click", ()=>{
      if(!navigator.geolocation){ showToast("المتصفح لا يدعم تحديد الموقع"); return; }
      navigator.geolocation.getCurrentPosition(
        pos=>{
          lastCoords = pos.coords;
          const { latitude, longitude } = pos.coords;
          updateMap(`${latitude},${longitude}`);
          if(!addr.value) addr.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        },
        ()=> showToast("تعذر الحصول على الموقع")
      );
    });

    // WhatsApp button live link
    const form = $("#co");
    const setWA = ()=> waBtn.href = buildWhatsAppLink(form);
    form.addEventListener("input", setWA);
    setWA();

    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      // Open WhatsApp with filled message:
      window.open(buildWhatsAppLink(form), "_blank");
      showToast("تم إرسال الطلب إلى واتساب ✅");
      // Clear cart & go home
      state.cart = []; save("cart", state.cart); updateCartCount();
      setTimeout(()=> location.hash = "#/", 600);
    });
  }

  function viewAbout(){
    app.innerHTML = `
      <section class="section">
        <h2>من نحن — سترة</h2>
        <div class="card" style="padding:16px">
          <p style="line-height:1.9">
            ✨ <strong>سترة للعبايات</strong> صفحة خُصّصت لكل بنت وسيدة تعشق الأناقة والاحتشام.
            فكرتنا بسيطة: نخلي العباية <strong>خيارِكِ الأول</strong> أينما كنتِ — طلعة يومية، دوام، جامعة
            وحتى مناسبة. في سترة راح تلاقي العباية اللي تعكس شخصيتك وتمنحك حضور واثق وأناقة متجددة.
          </p>
          <p style="line-height:1.9">
            نؤمن أن العباية ليست مجرد لبس؛ هي <strong>هوية وذوق وراحة</strong>. هدفنا أن تكون سترة خيارك الدائم بأناقتك وحضورك. 🌹
          </p>
        </div>
      </section>
    `;
  }

  function viewDeliveryPS(){
    app.innerHTML = `
      <section class="section">
        <h2>التوصيل إلى فلسطين 🇵🇸</h2>
        <div class="card" style="padding:16px">
          <ul style="line-height:2">
            <li>التوصيل متاح إلى معظم المدن الرئيسية (رام الله، القدس، نابلس، الخليل...)</li>
            <li>المدّة المتوقعة: <strong>3–6 أيام عمل</strong> حسب المنطقة.</li>
            <li>التكلفة: <strong>د.أ 3</strong> ثابتة — مجاناً للطلبات فوق <strong>د.أ 100</strong>.</li>
            <li>الدفع عند الاستلام أو تأكيد عبر واتساب.</li>
            <li>تتبّع حالة طلبك عبر رسائل واتساب بعد الشحن.</li>
          </ul>
          <a class="whats-btn" href="https://wa.me/${PHONE_E164}?text=${encodeURIComponent('أرغب بالتوصيل إلى فلسطين، ما الخيارات المتاحة؟')}" target="_blank" rel="noopener">اسألي عن منطقتك عبر واتساب</a>
        </div>
      </section>
    `;
  }

  function viewPolicy({ slug }){
    const content = {
      shipping: `
        <h2>سياسة الشحن</h2>
        <p class="lead">توصيل داخل الأردن 🇯🇴 وفلسطين 🇵🇸.</p>
        <ul><li>المدّة 2–4 أيام بالأردن، 3–6 أيام بفلسطين.</li><li>شحن مجاني فوق د.أ 100.</li><li>رسائل واتساب للتتبع.</li></ul>
      `,
      returns: `
        <h2>الإرجاع والاستبدال</h2>
        <p class="lead">استبدال مقاس خلال 7 أيام بحالته الأصلية. الإرجاع خلال 14 يوماً.</p>
      `,
      privacy: `
        <h2>الخصوصية</h2>
        <p class="lead">نحترم خصوصيتك. لا نبيع بياناتك — نستخدمها فقط لمعالجة طلبك ودعمك.</p>
      `
    }[slug] || `<h2>السياسة</h2><p>غير متوفرة.</p>`;
    app.innerHTML = `<section class="section">${content}</section>`;
  }

  function viewContact(){
    app.innerHTML = `
      <section class="section">
        <h2>تواصل</h2>
        <p class="lead">للاستفسار عن المقاسات والطلبات، راسلينا على واتساب.</p>
        <div class="card" style="padding:16px">
          <p><strong>الهاتف:</strong> <a href="tel:+${PHONE_E164}">${PHONE_READ}</a></p>
          <p><strong>واتساب:</strong> <a class="whats-btn" href="https://wa.me/${PHONE_E164}" target="_blank" rel="noopener">مراسلة واتساب</a></p>
          <div class="mapbox" style="margin-top:10px">
            <iframe loading="lazy" src="https://www.google.com/maps?q=Amman%20Jordan&output=embed" allowfullscreen></iframe>
          </div>
        </div>
      </section>
    `;
  }

  function render(){
    const { view, params } = matchRoute();
    view(params);
    app.focus({preventScroll:true});
    $$('[data-link]').forEach(a=> a.addEventListener('click', e=>{
      e.preventDefault(); location.hash = a.getAttribute('href');
    }));
  }
})();
