/* Sutrah Abaya — Arabic/RTL Store SPA
   - Home sections fed by products.js tags (popular/new).
   - Product page has a small gallery (thumbs + arrows).
   - Cart, Checkout (WhatsApp + CliQ), basic pages.
*/

(() => {
  // ---------------- helpers ----------------
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  const app       = $("#app");
  const toast     = $("#toast");
  const cartCount = $("#cart-count");

  const PHONE_E164 = "962795178746";     // without +
  const PHONE_READ = "+962 79 517 8746";
  const INSTA      = "https://www.instagram.com/sutrah_abayajo";

  const state = {
    cart: load("cart", []),             // [{id,size,color,qty}]
    filters: { q:"", cat:"All", sort:"popular" },
    lastCoords: null
  };

  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function load(k, f){ try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch{ return f } }
  function money(n){ return `د.أ ${Number(n||0).toFixed(2)}`; }
  function copy(text){ navigator.clipboard?.writeText(text); showToast("Copied ✅"); }

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(()=> toast.classList.remove("show"), 1800);
  }

  const sortByRank = (arr, key) =>
    arr.slice().sort((a,b)=> ((a?.[key] ?? 999) - (b?.[key] ?? 999)));

  const io = new IntersectionObserver(
    (ents)=> ents.forEach(e=> e.isIntersecting && e.target.classList.add("in")),
    {threshold:.12}
  );
  const withReveal = el => { el.classList.add("reveal"); io.observe(el); return el; };

  // ---------------- cart ----------------
  const keyOf = it => `${it.id}-${it.size||'NA'}-${it.color||'NA'}`;
  const getCartQty = () => state.cart.reduce((a,i)=> a + Number(i.qty||0), 0);
  function updateCartCount(){ if(cartCount) cartCount.textContent = getCartQty(); }
  updateCartCount();

  function addToCart(item){
    const k  = keyOf(item);
    const ex = state.cart.find(i=> keyOf(i)===k);
    if(ex) ex.qty += item.qty || 1;
    else state.cart.push({ ...item, qty: item.qty || 1 });
    save("cart", state.cart); updateCartCount(); showToast("Added to cart");
  }
  function removeFromCart(i){ state.cart.splice(i,1); save("cart",state.cart); updateCartCount(); render(); }
  function setQty(i, qty){ state.cart[i].qty = Math.max(1, qty|0); save("cart",state.cart); updateCartCount(); render(); }

  // ---------------- router ----------------
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
      const ok = p.every((seg, i)=>{
        if(seg.startsWith(":")){ params[seg.slice(1)] = decodeURIComponent(segments[i]); return true; }
        return seg === segments[i];
      });
      if(ok) return { view: routes[pattern], params };
    }
    return { view: routes["/"], params:{} };
  }
  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);

  // ---------------- views ----------------

  // HOME: Popular/New fed by tags from products.js
  function viewHome(){
    app.innerHTML = `
      <section class="hero floaters">
        <div>
          <span class="pill">New</span>
          <h1>Sutrah — Your Modest Elegance</h1>
          <p>Practical abayas for every day: uni • work • occasions. Delivery in Jordan + Palestine.</p>
          <div class="cta">
            <a class="btn btn-primary" href="#/shop">Shop now</a>
            <a class="btn" href="${INSTA}" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
        <div aria-hidden="true">
          <img src="${PRODUCTS[0]?.images?.[0] || ""}" alt="" style="border-radius:16px; box-shadow:var(--shadow)">
        </div>
      </section>

      <section class="section">
        <h2>Popular</h2>
        <p class="lead">Customer favorites.</p>
        <div class="grid" id="home-trending"></div>
      </section>

      <section class="section">
        <h2>New Arrivals</h2>
        <p class="lead">Fresh drops in limited quantities.</p>
        <div class="grid" id="home-new"></div>
      </section>
    `;

    const popularList = sortByRank(
      (window.PRODUCTS || []).filter(p => p.tags?.includes("popular")),
      "rankPopular"
    ).slice(0, 8);

    const newList = sortByRank(
      (window.PRODUCTS || []).filter(p => p.tags?.includes("new")),
      "rankNew"
    ).slice(0, 8);

    const t = $("#home-trending");
    const n = $("#home-new");
    t.innerHTML = ""; n.innerHTML = "";
    popularList.forEach(p => t.append(productCard(p)));
    newList.forEach(p => n.append(productCard(p)));

    $$(".section").forEach(withReveal);
  }

  // CARD
  function productCard(p){
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <a href="#/product/${encodeURIComponent(p.id)}" class="media" aria-label="${p.title}">
        <img loading="lazy" src="${p.images?.[0] || ""}" alt="${p.title}">
      </a>
      <div class="info">
        <div class="muted">${p.category || ""}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <h3 style="margin:.2rem 0;font-size:1.05rem">${p.title}</h3>
          <div class="price">${money(p.price)}</div>
        </div>
        <div style="display:flex;gap:8px; flex-wrap:wrap">
          <button class="btn" data-quick="${p.id}">Quick add</button>
          <a class="btn btn-primary" href="#/product/${encodeURIComponent(p.id)}">Details</a>
        </div>
      </div>
    `;
    el.querySelector('[data-quick]').addEventListener('click', ()=>{
      addToCart({ id:p.id, size:p.sizes?.[0], color:p.colors?.[0], qty:1 });
    });
    return withReveal(el);
  }

  // SHOP
  function viewShop(){
    app.innerHTML = `
      <section class="section">
        <h2>Shop</h2>
        <p class="lead">Filter, search, and sort.</p>
        <div class="toolbar">
          <input id="q" type="search" placeholder="Search product..." value="${state.filters.q}">
          <select id="cat">
            ${["All","Abayas","Sets"].map(c=>`<option ${state.filters.cat===c?"selected":""}>${c}</option>`).join("")}
          </select>
          <select id="sort">
            <option value="popular" ${state.filters.sort==="popular"?"selected":""}>Popular</option>
            <option value="low" ${state.filters.sort==="low"?"selected":""}>Price: Low</option>
            <option value="high" ${state.filters.sort==="high"?"selected":""}>Price: High</option>
            <option value="new" ${state.filters.sort==="new"?"selected":""}>Newest</option>
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
      const okCat = cat==="All" || (p.category||"").toLowerCase().includes(cat.toLowerCase());
      const okQ   = !q || (p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));
      return okCat && okQ;
    });
    if(sort==="low")  items.sort((a,b)=> a.price - b.price);
    if(sort==="high") items.sort((a,b)=> b.price - a.price);
    if(sort==="new")  items = items.slice().reverse();
    g.innerHTML = ""; items.forEach(p=> g.append(productCard(p)));
  }

  // PRODUCT (gallery + options)
  function viewProduct({ id }){
    const p = PRODUCTS.find(x=> x.id === id);
    if(!p){ app.innerHTML = `<section class="section"><p>Product not found.</p></section>`; return; }

    app.innerHTML = `
      <section class="product section">
        <div class="gallery">
          <div class="main">
            <button class="nav prev" aria-label="Prev">‹</button>
            <img id="main-img" src="${p.images?.[0]||""}" alt="${p.title}">
            <button class="nav next" aria-label="Next">›</button>
          </div>
          <div class="thumbs">
            ${p.images.map((src,i)=>`<img data-i="${i}" src="${src}" alt="${p.title} — ${i+1}" ${i===0?'style="outline:2px solid var(--rose)"':''} />`).join("")}
          </div>
        </div>

        <div class="details">
          <div class="pill">${p.category || ""}</div>
          <h1 style="margin:.5rem 0 0">${p.title}</h1>
          <p class="muted">${p.description || ""}</p>
          <h3 class="price" style="margin:.2rem 0 10px">${money(p.price)}</h3>

          <div class="options">
            <div>
              <div class="muted" style="margin-bottom:6px">Color</div>
              <div class="swatches" id="color-sw">
                ${p.colors.map((c,i)=>`<button class="swatch" aria-pressed="${i===0?'true':'false'}">${c}</button>`).join("")}
              </div>
            </div>
            <div>
              <div class="muted" style="margin-bottom:6px">Size</div>
              <div class="sizes" id="size-sw">
                ${p.sizes.map((s,i)=>`<button class="size" aria-pressed="${i===0?'true':'false'}">${s}</button>`).join("")}
              </div>
            </div>
            <div class="qty">
              <label for="qty" class="muted">Qty</label>
              <input id="qty" type="number" min="1" value="1" />
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button id="add" class="btn btn-primary">Add to cart</button>
              <a class="btn" href="#/cart">Go to cart</a>
            </div>
          </div>
        </div>
      </section>
    `;

    let cur = 0;
    const main  = $("#main-img");
    const thumbs= $$(".thumbs img");
    const prev  = $(".nav.prev");
    const next  = $(".nav.next");

    function set(i){
      cur = (i+thumbs.length) % thumbs.length;
      main.src = p.images[cur];
      thumbs.forEach(x=> x.style.outline="none");
      thumbs[cur].style.outline = "2px solid var(--rose)";
    }
    thumbs.forEach(img=> img.addEventListener("click", ()=> set(parseInt(img.dataset.i,10))));
    prev.addEventListener("click", ()=> set(cur-1));
    next.addEventListener("click", ()=> set(cur+1));

    // options
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
      const c = $("#color-sw .swatch[aria-pressed='true']")?.textContent || p.colors?.[0];
      const s = $("#size-sw .size[aria-pressed='true']")?.textContent || p.sizes?.[0];
      const q = parseInt($("#qty").value || "1", 10);
      addToCart({ id: p.id, color: c, size: s, qty: q });
    });
    withReveal($(".product"));
  }

  // CART
  function viewCart(){
    const items = state.cart.map(ci => {
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"Unknown", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = items.length ? 3.00 : 0;
    const total = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>Cart</h2>
        ${!items.length ? `<p class="lead">Your cart is empty. <a class="btn" href="#/shop">Shop</a></p>` : `
          <div style="display:grid; grid-template-columns:1fr 320px; gap:16px; align-items:start">
            <div class="card" style="overflow:auto">
              <table class="table">
                <thead><tr><th>Item</th><th>Options</th><th>Qty</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  ${items.map((it, i)=>`
                    <tr>
                      <td style="display:flex; gap:10px; align-items:center">
                        <img src="${it.prod.images[0]}" alt="">
                        <div><div style="font-weight:700">${it.prod.title}</div><small class="muted">${it.id}</small></div>
                      </td>
                      <td>${it.color || "-"} / ${it.size || "-"}</td>
                      <td>
                        <span class="qty-step">
                          <button aria-label="minus" data-minus="${i}">−</button>
                          <input type="number" min="1" value="${it.qty}" data-qty="${i}">
                          <button aria-label="plus" data-plus="${i}">+</button>
                        </span>
                      </td>
                      <td>${money(it.line)}</td>
                      <td><button class="btn" data-rm="${i}" aria-label="remove">Remove</button></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="summary">
              <div class="box">
                <div style="display:flex; justify-content:space-between"><span class="muted">Subtotal</span><strong>${money(subtotal)}</strong></div>
                <div style="display:flex; justify-content:space-between"><span class="muted">Shipping</span><strong>${money(shipping)}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:1.2rem; margin-top:6px"><span>Total</span><strong>${money(total)}</strong></div>
                <a class="btn btn-primary" style="width:100%; margin-top:10px" href="#/checkout">Checkout</a>
              </div>
            </div>
          </div>
        `}
      </section>
    `;
    $$("button[data-rm]").forEach(b=> b.addEventListener("click", ()=> removeFromCart(parseInt(b.dataset.rm,10))));
    $$("input[data-qty]").forEach(inp=> inp.addEventListener("change", ()=> setQty(parseInt(inp.dataset.qty,10), parseInt(inp.value||"1",10))));
    $$("button[data-minus]").forEach(b=> b.addEventListener("click", ()=> {
      const i=parseInt(b.dataset.minus,10); setQty(i, state.cart[i].qty - 1);
    }));
    $$("button[data-plus]").forEach(b=> b.addEventListener("click", ()=> {
      const i=parseInt(b.dataset.plus,10); setQty(i, state.cart[i].qty + 1);
    }));
  }

  // CHECKOUT (WhatsApp + CliQ)
  function viewCheckout(){
    const items = state.cart.map(ci => {
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"Unknown", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    if(!items.length){ location.hash = "#/cart"; return; }

    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = 3.00;
    const total    = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>Checkout</h2>
        <div class="checkout">
          <form id="co" class="check-card">
            <div class="step">1 • Shipping details</div>
            <div class="form-row" style="margin-top:8px">
              <input name="name"  placeholder="Full name" required />
              <input name="phone" class="ltr" placeholder="Phone" required />
            </div>
            <div class="form-row">
              <input id="addr" name="address" placeholder="Address (city, street, building)" required />
            </div>
            <div class="form-row">
              <button id="open-maps" class="btn" type="button">Open Maps</button>
              <button id="myloc"     class="btn" type="button">Use my location</button>
            </div>
            <div class="mapbox">
              <iframe id="gmap" loading="lazy" src="https://www.google.com/maps?q=Amman%20Jordan&output=embed" allowfullscreen></iframe>
            </div>

            <div class="step" style="margin-top:12px">2 • Payment method</div>
            <div class="pay-options form-row" aria-label="Payment">
              <label><input type="radio" name="pay" value="wa" checked> WhatsApp — <span class="muted">Cash on delivery (fast confirm)</span></label>
              <label><input type="radio" name="pay" value="cliq"> CliQ — <span class="muted">Transfer to same number</span></label>
            </div>

            <div id="cliq-box" class="cliq-clean" style="display:none">
              <p class="notice-strong" style="margin:0 0 8px">Transfer via CliQ to this number:</p>
              <div class="row">
                <strong class="ltr">${PHONE_READ}</strong>
                <button type="button" class="btn" id="copy-cliq">Copy number</button>
                <span class="amount">Amount: ${money(total)}</span>
              </div>
              <p class="muted" style="margin:.6rem 0 0">
                After transferring, send a screenshot on WhatsApp to confirm and we'll process the order.
              </p>
            </div>

            <div class="step" style="margin-top:12px">3 • Notes</div>
            <div class="form-row"><textarea name="note" rows="3" placeholder="Note to order (optional)"></textarea></div>

            <div class="form-row" style="margin-top:10px">
              <a id="wa-btn" class="whats-btn big" href="#" target="_blank" rel="noopener">Send order via WhatsApp</a>
            </div>
            <p class="muted under-cta-note">
              We include a Google Maps directions link so the courier can reach you directly.
            </p>
          </form>

          <div class="check-card">
            <div class="step">Order summary</div>
            <table class="table" style="margin-top:6px">
              <tbody>
                ${items.map(it=>`
                  <tr>
                    <td style="display:flex; gap:10px; align-items:center">
                      <img src="${it.prod.images[0]}" alt="">
                      <div><div style="font-weight:700">${it.prod.title}</div><small class="muted">${it.color || "-"} / ${it.size || "-"}</small></div>
                    </td>
                    <td style="text-align:end">${money(it.line)}</td>
                  </tr>`).join("")}
                <tr><td class="muted">Subtotal</td><td style="text-align:end">${money(subtotal)}</td></tr>
                <tr><td class="muted">Shipping</td><td style="text-align:end">${money(shipping)}</td></tr>
                <tr><td><strong>Total</strong></td><td style="text-align:end"><strong>${money(total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    const addr = $("#addr");
    const gmap = $("#gmap");
    const waBtn= $("#wa-btn");
    const payR = $$("input[name='pay']");
    const cliq = $("#cliq-box");
    $("#copy-cliq")?.addEventListener("click", ()=> copy(PHONE_READ));

    payR.forEach(r => r.addEventListener("change", ()=>{
      cliq.style.display = r.value==="cliq" && r.checked ? "block" : "none";
    }));

    function mapsDirectionsLink(){
      if(state.lastCoords){
        const { latitude, longitude } = state.lastCoords;
        return `https://www.google.com/maps/dir/?api=1&destination=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      }
      const q = addr.value.trim() || "Amman Jordan";
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
    }
    function updateMap(q){
      gmap.src = "https://www.google.com/maps?q=" + encodeURIComponent(q || "Amman Jordan") + "&output=embed";
    }
    function buildWhatsAppLink(form){
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const address = form.address.value.trim();
      const note = (form.note.value || "").trim();

      const lines = [];
      lines.push("New order from Sutrah ✨");
      lines.push(`Name: ${name}`);
      lines.push(`Phone: ${phone}`);
      lines.push(`Address: ${address}`);
      if(state.lastCoords){
        lines.push(`GPS: ${state.lastCoords.latitude.toFixed(6)}, ${state.lastCoords.longitude.toFixed(6)}`);
      }
      lines.push(`Directions: ${mapsDirectionsLink()}`);
      if(note) lines.push(`Note: ${note}`);
      lines.push("");
      lines.push("Items:");
      state.cart.forEach(ci=>{
        const p = PRODUCTS.find(pp=> pp.id===ci.id);
        if(p) lines.push(`• ${p.title} — Color: ${ci.color || "-"}, Size: ${ci.size || "-"} × ${ci.qty}`);
      });
      const sub = state.cart.reduce((a,ci)=> {
        const p = PRODUCTS.find(pp=> pp.id===ci.id); return a + (p?p.price:0)*ci.qty;
      }, 0);
      const shp = state.cart.length ? 3.00 : 0;
      lines.push("");
      lines.push(`Subtotal: ${money(sub)}`);
      lines.push(`Shipping: ${money(shp)}`);
      lines.push(`Total: ${money(sub + shp)}`);
      lines.push("");
      const paySel = $$("input[name='pay']").find(x=>x.checked)?.value;
      lines.push(paySel==="cliq" ? `Payment: CliQ to ${PHONE_READ}` : "Payment: Cash on delivery (confirm via WhatsApp)");

      const text = encodeURIComponent(lines.join("\n"));
      return `https://wa.me/${PHONE_E164}?text=${text}`;
    }

    $("#open-maps").addEventListener("click", ()=> window.open(mapsDirectionsLink(), "_blank"));
    addr.addEventListener("change", ()=> updateMap(addr.value));
    $("#myloc").addEventListener("click", ()=>{
      if(!navigator.geolocation){ showToast("Geolocation not supported"); return; }
      navigator.geolocation.getCurrentPosition(
        pos=>{
          state.lastCoords = pos.coords;
          const { latitude, longitude } = pos.coords;
          updateMap(`${latitude},${longitude}`);
          if(!addr.value) addr.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        },
        ()=> showToast("Could not get location")
      );
    });

    const form = $("#co");
    const setLinks = ()=> { waBtn.href = buildWhatsAppLink(form); };
    form.addEventListener("input", setLinks);
    setLinks();

    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      window.open(buildWhatsAppLink(form), "_blank");
      showToast("Order sent on WhatsApp ✅");
      state.cart = []; save("cart", state.cart); updateCartCount();
      setTimeout(()=> location.hash = "#/", 600);
    });
  }

  // STATIC PAGES
  function viewAbout(){
    app.innerHTML = `
      <section class="section">
        <h2>About Sutrah</h2>
        <div class="card" style="padding:16px">
          <p>We design modest, comfortable, and elegant abayas for daily life and occasions.</p>
        </div>
      </section>
    `;
  }
  function viewDeliveryPS(){
    app.innerHTML = `
      <section class="section">
        <h2>Delivery to Palestine 🇵🇸</h2>
        <div class="card" style="padding:16px">
          <ul style="line-height:2">
            <li>Main cities: Ramallah, Jerusalem, Nablus, Hebron…</li>
            <li>ETA: <strong>3–6 business days</strong> depending on area.</li>
            <li>Fee: <strong>د.أ 3</strong> — free above <strong>د.أ 100</strong>.</li>
            <li>Payment: COD, WhatsApp, or CliQ to the same number.</li>
          </ul>
          <a class="whats-btn" href="https://wa.me/${PHONE_E164}?text=${encodeURIComponent('I want delivery to Palestine, what are the options?')}" target="_blank" rel="noopener">Ask on WhatsApp</a>
        </div>
      </section>
    `;
  }
  function viewPolicy({ slug }){
    const content = {
      shipping: `
        <h2>Shipping Policy</h2>
        <p class="lead">We deliver in Jordan 🇯🇴 and Palestine 🇵🇸.</p>
        <ul><li>2–4d in Jordan, 3–6d in Palestine.</li><li>Free above د.أ 100.</li><li>Directions link in each order.</li></ul>
      `,
      returns: `
        <h2>Returns & Exchanges</h2>
        <p class="lead">Exchange size within 7 days in original condition. Returns within 14 days.</p>
      `,
      privacy: `
        <h2>Privacy</h2>
        <p class="lead">We respect your privacy and only use your data to process and support your orders.</p>
      `
    }[slug] || `<h2>Policy</h2><p>Not found.</p>`;
    app.innerHTML = `<section class="section">${content}</section>`;
  }
  function viewContact(){
    app.innerHTML = `
      <section class="section">
        <h2>Contact</h2>
        <p class="lead">Sizing and orders — we’re happy to help.</p>
        <div class="card" style="padding:16px">
          <p><strong>Phone:</strong> <a class="ltr" href="tel:+${PHONE_E164}">${PHONE_READ}</a></p>
          <p><strong>WhatsApp:</strong> <a class="whats-btn" href="https://wa.me/${PHONE_E164}" target="_blank" rel="noopener">Chat on WhatsApp</a></p>
          <p><strong>Instagram:</strong> <a class="ltr" href="${INSTA}" target="_blank" rel="noopener">@sutrah_abayajo</a></p>
          <div class="mapbox" style="margin-top:10px">
            <iframe loading="lazy" src="https://www.google.com/maps?q=Amman%20Jordan&output=embed" allowfullscreen></iframe>
          </div>
        </div>
      </section>
    `;
  }

  // render
  function render(){
    const { view, params } = matchRoute();
    view(params);
    app?.focus?.({preventScroll:true});
  }
})();

// ---- Smart topbar (hide on scroll down, show on up) ----
(function(){
  const bar = document.getElementById('topbar');
  if(!bar) return;

  let lastY = window.scrollY;
  let ticking = false;
  let revealLock = false;
  const COMPACT_AT = 80;
  const HIDE_DELTA = 8;

  function onScroll(){
    const y = window.scrollY;
    const dy = y - lastY;

    if(y > COMPACT_AT) bar.classList.add('is-scrolled','is-compact');
    else bar.classList.remove('is-scrolled','is-compact');

    if(Math.abs(dy) > HIDE_DELTA && !revealLock){
      if(dy > 0 && y > COMPACT_AT) bar.classList.add('is-hidden');
      else bar.classList.remove('is-hidden');
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });

  window.addEventListener('mousemove', (e)=>{
    if(e.clientY < 60){
      bar.classList.remove('is-hidden');
      revealLock = true; setTimeout(()=> revealLock=false, 250);
    }
  });
})();
