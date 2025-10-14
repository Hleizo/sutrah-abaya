/* SPA router + UI logic + cart. */
(() => {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  const app = $("#app");
  const toast = $("#toast");
  const cartCount = $("#cart-count");

  const PHONE = "+962795178746"; // used in contact & checkout help

  const state = {
    cart: load("cart", []),      // [{id, size, color, qty}]
    filters: { q:"", cat:"All", sort:"popular" }
  };

  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function load(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }

  function money(n){ return "د.أ " + n.toFixed(2); }

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(()=> toast.classList.remove("show"), 2500);
  }

  function setYear(){ $("#year").textContent = new Date().getFullYear(); }
  setYear();

  $("#newsletter-form").addEventListener("submit", e=>{
    e.preventDefault(); showToast("Thanks for subscribing!"); e.target.reset();
  });

  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=> e.isIntersecting && e.target.classList.add("in"));
  }, {threshold: .12});
  const withReveal = el => { el.classList.add("reveal"); io.observe(el); return el; };

  /* CART */
  const keyOf = it => `${it.id}-${it.size||'NA'}-${it.color||'NA'}`;
  const getCartQty = () => state.cart.reduce((a,i)=>a + Number(i.qty||0), 0);
  const updateCartCount = () => cartCount.textContent = getCartQty();
  updateCartCount();

  function addToCart(item){
    const k = keyOf(item);
    const ex = state.cart.find(i=> keyOf(i)===k);
    if(ex){ ex.qty += item.qty || 1; }
    else state.cart.push({ ...item, qty: item.qty || 1 });
    save("cart", state.cart); updateCartCount(); showToast("Added to cart");
  }
  function removeFromCart(i){ state.cart.splice(i,1); save("cart", state.cart); updateCartCount(); render(); }
  function changeQty(i, qty){ state.cart[i].qty = Math.max(1, qty|0); save("cart", state.cart); updateCartCount(); render(); }

  /* ROUTER */
  const routes = {
    "/": viewHome,
    "/shop": viewShop,
    "/product/:id": viewProduct,
    "/cart": viewCart,
    "/checkout": viewCheckout,             // NEW
    "/policy/:slug": viewPolicy,
    "/contact": viewContact                // NEW
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
        if(seg.startsWith(":")){ params[seg.slice(1)] = segments[i]; return true; }
        return seg === segments[i];
      });
      if(ok) return { view: routes[pattern], params };
    }
    return { view: routes["/"], params:{} };
  }
  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);

  /* VIEWS */
  function viewHome(){
    app.innerHTML = `
      <section class="hero floaters">
        <div>
          <span class="pill">جديدنا • New</span>
          <h1>سترة — أناقتكِ في سترك</h1>
          <p>عبايات عملية ومناسبة لكل طلة: جامعة، دوام، مناسبة. Delivery in Jordan & Palestine.</p>
          <div class="cta">
            <a class="btn btn-primary" href="#/shop">Shop abayas</a>
            <a class="btn" href="#/contact">WhatsApp us</a>
          </div>
        </div>
        <div aria-hidden="true">
          <img src="${PRODUCTS[0].images[0]}" alt="" style="border-radius:16px; box-shadow:var(--shadow)">
        </div>
      </section>

      <section class="section">
        <h2>Trending now</h2>
        <p class="lead">Handpicked favorites our customers love.</p>
        <div class="grid" id="home-trending"></div>
      </section>

      <section class="section">
        <h2>New Arrivals</h2>
        <p class="lead">Fresh styles just landed — limited stock.</p>
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
      <a href="#/product/${p.id}" class="media" aria-label="${p.title}">
        <img loading="lazy" src="${p.images[0]}" alt="${p.title}" />
      </a>
      <div class="info">
        <div class="muted">${p.category}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <h3 style="margin:.2rem 0;font-size:1.05rem">${p.title}</h3>
          <div class="price">${money(p.price)}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn" data-quick="${p.id}">Quick add</button>
          <a class="btn btn-primary" href="#/product/${p.id}">Details</a>
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
        <h2>Shop</h2>
        <p class="lead">Filter, search, sort — find your fit.</p>
        <div class="toolbar">
          <input id="q" type="search" placeholder="Search products..." value="${state.filters.q}">
          <select id="cat">
            ${["All","Women"].map(c=>`<option ${state.filters.cat===c?"selected":""}>${c}</option>`).join("")}
          </select>
          <select id="sort">
            <option value="popular" ${state.filters.sort==="popular"?"selected":""}>Sort: Popular</option>
            <option value="low" ${state.filters.sort==="low"?"selected":""}>Price: Low → High</option>
            <option value="high" ${state.filters.sort==="high"?"selected":""}>Price: High → Low</option>
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
      const okCat = cat==="All" || p.category===cat;
      const okQ = !q || (p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));
      return okCat && okQ;
    });
    if(sort==="low") items.sort((a,b)=> a.price - b.price);
    if(sort==="high") items.sort((a,b)=> b.price - a.price);
    if(sort==="new") items = items.slice().reverse();
    g.innerHTML = ""; items.forEach(p=> g.append(productCard(p)));
  }

  function viewProduct({ id }){
    const p = PRODUCTS.find(x=> x.id === id);
    if(!p){ app.innerHTML = `<p>Product not found.</p>`; return; }

    app.innerHTML = `
      <section class="product section">
        <div class="gallery">
          <div class="main"><img id="main-img" src="${p.images[0]}" alt="${p.title}"></div>
          <div class="thumbs">
            ${p.images.map((src,i)=>`<img data-src="${src}" alt="View ${i+1} of ${p.title}" ${i===0?'style="outline:2px solid var(--rose)"':''} />`).join("")}
          </div>
        </div>
        <div class="details">
          <div class="pill">${p.category}</div>
          <h1 style="margin:.5rem 0 0">${p.title}</h1>
          <p class="muted">${p.description}</p>
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
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"Unknown", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = items.length ? 3.00 : 0;
    const total = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>Your cart</h2>
        ${!items.length ? `<p class="lead">Cart is empty. <a class="btn" href="#/shop">Go shopping</a></p>` : `
          <div style="overflow:auto">
            <table class="table">
              <thead>
                <tr><th>Item</th><th>Options</th><th>Qty</th><th>Price</th><th></th></tr>
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
                    <td><input type="number" min="1" value="${it.qty}" data-qty="${i}" style="width:64px"></td>
                    <td>${money(it.line)}</td>
                    <td><button class="btn" data-rm="${i}" aria-label="Remove">Remove</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div style="display:flex; gap:16px; margin-top:12px; flex-wrap:wrap; align-items:flex-start">
            <div class="pill">Have a question? <a href="https://wa.me/962795178746" target="_blank">WhatsApp us</a></div>
            <div class="right" style="margin-left:auto; min-width:260px">
              <div style="display:flex; justify-content:space-between"><span class="muted">Subtotal</span><strong>${money(subtotal)}</strong></div>
              <div style="display:flex; justify-content:space-between"><span class="muted">Shipping</span><strong>${money(shipping)}</strong></div>
              <div style="display:flex; justify-content:space-between; font-size:1.2rem; margin-top:6px"><span>Total</span><strong>${money(total)}</strong></div>
              <a class="btn btn-primary" style="width:100%; margin-top:10px" href="#/checkout">Checkout</a>
            </div>
          </div>
        `}
      </section>
    `;
    $$("button[data-rm]").forEach(b=> b.addEventListener("click", ()=> removeFromCart(parseInt(b.dataset.rm,10))));
    $$("input[data-qty]").forEach(inp=> inp.addEventListener("change", ()=> changeQty(parseInt(inp.dataset.qty,10), parseInt(inp.value||"1",10))));
  }

  /* CHECKOUT with Google Maps embed (no API key needed) */
  function viewCheckout(){
    const items = state.cart.map(ci => {
      const prod = PRODUCTS.find(p=> p.id===ci.id) || { price:0, title:"Unknown", images:[""] };
      return { ...ci, prod, line: prod.price * ci.qty };
    });
    if(!items.length){ location.hash = "#/cart"; return; }

    const subtotal = items.reduce((a,i)=> a + i.line, 0);
    const shipping = 3.00;
    const total = subtotal + shipping;

    app.innerHTML = `
      <section class="section">
        <h2>Checkout</h2>
        <div style="display:grid; gap:16px; grid-template-columns:1fr 0.9fr">
          <form id="co" class="card" style="padding:14px">
            <h3>Shipping details</h3>
            <div class="toolbar" style="margin:8px 0 0 0">
              <input name="name" placeholder="Full name" required />
              <input name="phone" placeholder="Phone" value="${PHONE.replace('+','+ ')}" required />
            </div>
            <div class="toolbar" style="margin-top:10px">
              <input id="addr" name="address" placeholder="Address (city, street, building)" required />
              <button id="open-maps" class="btn" type="button" title="Open in Google Maps">Open in Maps</button>
              <button id="myloc" class="btn" type="button" title="Use my GPS location">Use my location</button>
            </div>
            <div class="mapbox" style="margin-top:10px">
              <iframe id="gmap" loading="lazy"
                src="https://www.google.com/maps?q=Amman%20Jordan&output=embed"
                allowfullscreen></iframe>
            </div>
            <div class="toolbar" style="margin-top:10px">
              <input name="note" placeholder="Order note (optional)" />
            </div>
            <button class="btn btn-primary" style="margin-top:12px">Place order</button>
            <small class="muted">Demo checkout — you’ll see a success message.</small>
          </form>

          <div class="card" style="padding:14px">
            <h3>Order summary</h3>
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
                    <td style="text-align:right">${money(it.line)}</td>
                  </tr>`).join("")}
                <tr><td class="muted">Subtotal</td><td style="text-align:right">${money(subtotal)}</td></tr>
                <tr><td class="muted">Shipping</td><td style="text-align:right">${money(shipping)}</td></tr>
                <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${money(total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    const addr = $("#addr");
    const gmap = $("#gmap");

    function updateMap(q){
      const url = "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
      gmap.src = url;
    }
    $("#open-maps").addEventListener("click", ()=>{
      const q = addr.value.trim() || "Amman Jordan";
      window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q), "_blank");
    });
    addr.addEventListener("change", ()=> updateMap(addr.value));

    $("#myloc").addEventListener("click", ()=>{
      if(!navigator.geolocation){ showToast("Geolocation not supported"); return; }
      navigator.geolocation.getCurrentPosition(
        pos=>{
          const { latitude, longitude } = pos.coords;
          updateMap(`${latitude},${longitude}`);
          addr.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        },
        ()=> showToast("Couldn’t get your location")
      );
    });

    $("#co").addEventListener("submit", (e)=>{
      e.preventDefault();
      showToast("Order placed — شكراً لكِ! We’ll confirm on WhatsApp.");
      state.cart = []; save("cart", state.cart); updateCartCount();
      setTimeout(()=> location.hash = "#/", 800);
    });
  }

  function viewPolicy({ slug }){
    const content = {
      shipping: `
        <h2>Shipping Policy</h2>
        <p class="lead">Delivery available in Jordan 🇯🇴 and Palestine 🇵🇸.</p>
        <ul><li>Standard 2–4 business days.</li><li>Free shipping over د.أ 100.</li><li>Tracked delivery for all orders.</li></ul>
      `,
      returns: `
        <h2>Return & Refund Policy</h2>
        <p class="lead">30-day returns in original condition. Free size exchanges.</p>
      `,
      privacy: `
        <h2>Privacy Policy</h2>
        <p class="lead">We collect only what’s needed to fulfill and support your order. No data sale.</p>
      `
    }[slug] || `<h2>Policy</h2><p>Not found.</p>`;
    app.innerHTML = `<section class="section">${content}</section>`;
  }

  function viewContact(){
    app.innerHTML = `
      <section class="section">
        <h2>Contact</h2>
        <p class="lead">WhatsApp us for sizing & orders.</p>
        <div class="card" style="padding:14px">
          <p><strong>Phone:</strong> <a href="tel:${PHONE}">${PHONE}</a></p>
          <p><strong>WhatsApp:</strong> <a href="https://wa.me/962795178746" target="_blank" rel="noopener">Message us</a></p>
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
