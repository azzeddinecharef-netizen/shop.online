const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let catalog, adminData, selected='الكل', query='', editing=null, images=[];
let cart;try{cart=JSON.parse(localStorage.getItem('shop-cart')||'[]');if(!Array.isArray(cart))cart=[];cart=cart.filter(i=>typeof i.id==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=99).slice(0,30);}catch{cart=[];}
const money=n=>new Intl.NumberFormat('ar-DZ',{style:'currency',currency:catalog?.settings.currency||'DZD'}).format(n);
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;setTimeout(()=>$('#toast').hidden=true,4500);}
async function api(path,data){
  const r=await fetch(path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
  const result=await r.json();if(!r.ok)throw new Error(result.error||'تعذر إتمام العملية.');return result;
}
function count(){ $('#count').textContent=cart.reduce((n,i)=>n+i.quantity,0);localStorage.setItem('shop-cart',JSON.stringify(cart));}
function branding(){const name=catalog.settings.name;$('.brand>span:last-child').innerHTML=`${esc(name)}<small>أشياء تحبّها، لحياة أسهل.</small>`;$('.footerbrand').textContent=name;}
function add(id,quantity=1){const p=catalog.products.find(p=>p.id===id);if(!p)return;const existing=cart.find(i=>i.id===id);
  if(!Number.isInteger(quantity)||quantity<1||quantity+(existing?.quantity||0)>p.stock)return toast('الكمية المطلوبة غير متوفرة.');
  if(existing)existing.quantity+=quantity;else cart.push({id,quantity});count();toast('أُضيف المنتج إلى حقيبتك.');}
function art(p){return `<div class="product-art">${p.images.length?`<img src="/${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy">`:`<span class="initial" aria-hidden="true">${esc(p.name.slice(0,1))}</span>`}${catalog.demo?'<span class="demo-tag">عرض تجريبي</span>':''}</div>`;}
function cards(){
  const list=catalog.products.filter(p=>(selected==='الكل'||p.category===selected)&&`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  $('#products').innerHTML=list.length?list.map(p=>`<article class="card"><a href="/product/${encodeURIComponent(p.slug)}">${art(p)}</a><div class="cardbody"><span class="category">${esc(p.category)}</span><a href="/product/${encodeURIComponent(p.slug)}"><h3>${esc(p.name)}</h3></a><div class="price-row"><span class="price">${money(p.price)}</span><button class="round" data-add="${esc(p.id)}" aria-label="إضافة ${esc(p.name)} إلى السلة">+</button></div></div></article>`).join(''):'<div class="empty full">لا توجد منتجات متاحة هنا حاليًا.</div>';
}
function home(){
  const s=catalog.settings;
  $('#main').innerHTML=`<section class="hero"><div class="hero-copy"><span class="eyebrow">SHOP ONLINE / اختيارات يومية</span><h1>${esc(s.headline)}</h1><p>${esc(s.introduction)}</p><a class="primary" href="#collection">اكتشف المنتجات ←</a></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="bag">S</div><span class="art-note">تفاصيل صغيرة. اختيارات كثيرة.</span></div></section><div class="perks"><div>✦ أقسام متنوعة<span>تظهر المنتجات المتاحة فقط</span></div><div>◈ تفاصيل واضحة<span>صفحة مستقلة لكل منتج</span></div><div>↗ طلب بسهولة<span>الدفع عند الاستلام</span></div></div><section id="collection"><div class="section-head"><div><span class="eyebrow">THE COLLECTION</span><h2>اكتشف ما يناسبك</h2><p>منتجات متنوعة، واختيار على ذوقك.</p></div><input class="search" id="search" aria-label="البحث عن منتج" placeholder="ابحث عن شيء يعجبك…"></div><div class="filters">${['الكل',...catalog.categories].map(c=>`<button class="chip ${c===selected?'selected':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="grid" id="products"></div></section><section class="story"><div><span class="eyebrow">عن المتجر</span><h2>مكان واحد. اختيارات أكثر.</h2><p>${esc(s.about)}</p></div><a class="secondary" href="/about">تعرّف علينا ←</a></section>`;
  cards();$('#search').addEventListener('input',e=>{query=e.target.value;cards();});
}
function about(){const s=catalog.settings;$('#main').innerHTML=`<article class="narrow"><span class="eyebrow">OUR STORY / عن المتجر</span><h1 class="about-title">${esc(s.name)}<br>اختيارات تناسب يومك.</h1><p class="description">${esc(s.about)}</p><div class="panel"><h2>كيف تطلب؟</h2><p>اختر منتجاتك وأضفها إلى الحقيبة، ثم أدخل بيانات التوصيل. يُسجَّل طلبك ليتم تأكيده من فريق المتجر، والدفع عند الاستلام.</p><p>${esc(s.delivery)}</p></div><a class="primary" href="/">استكشف المتجر ←</a></article>`;}
function detail(){
  const slug=decodeURIComponent(location.pathname.slice(9)),p=catalog.products.find(p=>p.slug===slug);
  if(!p){$('#main').innerHTML='<div class="empty"><h1>المنتج غير متاح</h1><a href="/">العودة إلى المتجر</a></div>';return;}
  document.title=`${p.name} | ${catalog.settings.name}`;
  $('#main').innerHTML=`<div class="breadcrumb"><a href="/">المتجر</a> / ${esc(p.category)} / ${esc(p.name)}</div><section class="detail"><div id="gallery">${art(p)}<div class="thumbs">${p.images.map(path=>`<button data-image="${esc(path)}" aria-label="عرض صورة أخرى"><img src="/${esc(path)}" alt="${esc(p.name)}"></button>`).join('')}</div></div><div><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.name)}</h1><span class="price">${money(p.price)}</span><p class="description">${esc(p.description)}</p><p class="muted">متوفر: ${p.stock} قطعة</p><label for="quantity">الكمية</label><input class="qty" id="quantity" type="number" value="1" min="1" max="${p.stock}"><button id="buy" class="primary">أضف إلى الحقيبة +</button><div class="panel"><strong>الدفع عند الاستلام</strong><p class="muted">${esc(catalog.settings.delivery)}</p></div></div></section>`;
  $('#buy').onclick=()=>add(p.id,Number($('#quantity').value));
}
function cartPage(){
  const items=cart.map(i=>({...i,p:catalog.products.find(p=>p.id===i.id)}));
  $('#main').innerHTML=`<div class="narrow"><span class="eyebrow">YOUR BAG</span><h1>حقيبة التسوّق</h1>${items.length?`<div class="panel">${items.map(i=>`<div class="summary"><div><strong>${esc(i.p?.name||'منتج غير متاح')}</strong><div class="muted">${i.quantity} × ${i.p?money(i.p.price):'—'}</div></div><button class="secondary" data-remove="${esc(i.id)}">حذف</button></div>`).join('')}<div class="summary"><strong>مجموع المنتجات</strong><strong>${money(items.reduce((n,i)=>n+(i.p?.price||0)*i.quantity,0))}</strong></div><p class="muted">تكلفة التوصيل تُؤكّد معك قبل الشحن.</p></div><form id="orderform" class="panel"><h2>بيانات التوصيل</h2><div class="forms"><label>الاسم الكامل<input name="name" required minlength="2" maxlength="100" autocomplete="name"></label><label>رقم الهاتف<input name="phone" type="tel" required autocomplete="tel"></label><label class="full">العنوان الكامل<textarea name="address" required minlength="8" maxlength="500" autocomplete="street-address"></textarea></label><label class="check full"><input type="checkbox" required><span>أوافق على استخدام اسمي وهاتفي وعنواني لمعالجة طلبي وحفظها في سجل المتجر على Google Sheets.</span></label></div><button class="primary" ${catalog.demo?'disabled':''}>تأكيد طلب بالدفع عند الاستلام</button><p class="muted">${esc(catalog.settings.delivery)}</p></form>`:'<div class="empty">حقيبتك فارغة حاليًا.<br><a class="primary" href="/">ابدأ التسوّق</a></div>'}</div>`;
  if($('#orderform'))$('#orderform').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const result=await api('/api/orders',{...Object.fromEntries(new FormData(e.target)),items:cart});cart=[];count();$('#main').innerHTML=`<div class="success narrow"><h1>استلمنا طلبك</h1><p>رقم الطلب: ${esc(result.id)}</p><p>سنتواصل معك لتأكيد التوفر والتوصيل. لم يُحصّل أي مبلغ الآن.</p><a href="/">العودة للمتجر</a></div>`;}catch(err){toast(err.message);b.disabled=false;}};
}
async function adminPage(){
  const session=await api('/api/session');
  if(!session.admin&&!session.demo){$('#main').innerHTML=`<form id="login" class="panel narrow"><span class="eyebrow">STORE MANAGEMENT</span><h1>دخول الإدارة</h1><p class="muted">إدارة المنتجات والطلبات ومحتوى المتجر.</p><label>كلمة مرور الإدارة<input type="password" name="password" required autocomplete="current-password"></label><button class="primary">تسجيل الدخول</button><p id="login-error" role="alert"></p></form>`;$('#login').onsubmit=async e=>{e.preventDefault();try{await api('/api/login',Object.fromEntries(new FormData(e.target)));await adminPage();}catch(err){$('#login-error').textContent=err.message;}};return;}
  catalog.demo=session.demo;
  adminData=await api(session.demo?'/api/demo/admin':'/api/admin/data');images=[];editing=null;
  catalog.settings=adminData.settings;
  branding();
  if(session.demo){$('#notice').hidden=false;$('#notice').textContent='معاينة لوحة الإدارة — بيانات تجريبية فقط، والحفظ ورفع الصور معطّلان.';}
  $('#main').innerHTML=`<div class="adminhead"><div><span class="eyebrow">ADMIN DASHBOARD</span><h1>إدارة المتجر</h1></div><button class="secondary" id="logout">خروج</button></div><div class="tabs"><button class="chip selected" data-tab="products">المنتجات (${adminData.products.length})</button><button class="chip" data-tab="orders">الطلبات (${adminData.orders.length})</button><button class="chip" data-tab="settings">إعدادات المتجر</button></div><div id="admin-content"></div>`;
  $('#logout').onclick=async()=>{await api('/api/logout',{});location.reload();};adminProducts();
}
function adminProducts(){
  $('#admin-content').innerHTML=`<div class="panel"><div class="adminhead"><h2>المنتجات</h2><button class="primary" id="new">+ منتج جديد</button></div><div class="tablewrap"><table><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead><tbody>${adminData.products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${esc(p.status)}</td><td><button class="secondary" data-edit="${esc(p.id)}">تعديل</button> <a href="/product/${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">الرابط ↗</a></td></tr>`).join('')}</tbody></table></div></div><div id="editor"></div>`;
  $('#new').onclick=()=>{editing=null;images=[];editor();};
}
function editor(){
  const p=editing||{name:'',category:'',description:'',price:'',stock:1,status:'draft'};
  $('#editor').innerHTML=`<form id="productform" class="panel"><h2>${editing?'تعديل المنتج':'منتج جديد'}</h2><div class="forms"><label>اسم المنتج<input name="name" required maxlength="120" value="${esc(p.name)}"></label><label>القسم<input name="category" list="categories" required maxlength="80" value="${esc(p.category)}"><datalist id="categories">${adminData.categories.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></label><label>السعر (${esc(catalog.settings.currency)})<input name="price" type="number" min=".01" step=".01" required value="${esc(p.price)}"></label><label>المخزون<input name="stock" type="number" min="0" required value="${p.stock}"></label><label>الحالة<select name="status">${[['draft','مسودة'],['active','منشور'],['archived','مؤرشف']].map(([v,t])=>`<option value="${v}" ${p.status===v?'selected':''}>${t}</option>`).join('')}</select></label><label>صور المنتج (حتى 8 صور)<input id="files" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div class="full upload-preview" id="previews"></div><label class="full">وصف المنتج<textarea name="description" maxlength="6000">${esc(p.description)}</textarea></label></div><button class="primary" id="save-product">حفظ المنتج</button><p class="muted">يبقى رابط المنتج ثابتًا بعد تعديل الاسم. تظهر الأقسام التي تحتوي على منتجات منشورة ومتوفرة فقط.</p></form>`;
  previewImages();
  if(catalog.demo){$('#save-product').disabled=true;$('#files').disabled=true;}
  $('#files').onchange=async e=>{const files=[...e.target.files];if(images.length+files.length>8)return toast('الحد الأقصى 8 صور.');$('#save-product').disabled=true;e.target.disabled=true;try{for(const f of files){if(f.size>3*1024*1024)throw new Error('كل صورة يجب أن تكون أقل من 3 MB.');const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(f);});const result=await api('/api/admin/image',{base64:data});images.push(result.path);previewImages();}toast('رُفعت الصور إلى GitHub. احفظ المنتج لنشرها.');}catch(err){toast(err.message);}finally{$('#save-product').disabled=false;e.target.disabled=false;e.target.value='';}};
  $('#productform').onsubmit=async e=>{e.preventDefault();$('#save-product').disabled=true;try{const input=Object.fromEntries(new FormData(e.target));await api('/api/admin/product',{...input,id:editing?.id,images,price:Number(input.price),stock:Number(input.stock)});await adminPage();toast('حُفظ المنتج في Google Sheets.');}catch(err){toast(err.message);$('#save-product').disabled=false;}};
  $('#editor').scrollIntoView({behavior:'smooth'});
}
function previewImages(){ $('#previews').innerHTML=images.map((path,index)=>`<div><img src="/${esc(path)}" alt="صورة المنتج ${index+1}"><button type="button" data-drop="${index}" class="secondary">إزالة</button></div>`).join(''); }
function adminOrders(){
  $('#admin-content').innerHTML=`<div class="panel"><h2>طلبات الدفع عند الاستلام</h2><p class="muted">الطلبات الجديدة تحتاج تأكيد التوفر والتوصيل. عدّل المخزون بعد تأكيد الطلب؛ لا يتم حجز الكمية آليًا.</p>${adminData.orders.slice().reverse().map(o=>`<article class="panel"><div class="summary"><strong>${esc(o.name)}</strong><span>${money(o.total)}</span></div><p>${esc(o.phone)} · ${esc(o.address)}</p><p class="muted">${esc(o.id)} · ${esc(o.createdAt)}</p><ul>${o.items.map(i=>`<li>${esc(i.name)} × ${i.quantity}</li>`).join('')}</ul><label>حالة الطلب<select data-order="${esc(o.id)}">${[['pending','جديد'],['confirmed','مؤكد'],['shipped','شُحن'],['delivered','تم التسليم'],['cancelled','ملغى']].map(([v,t])=>`<option value="${v}" ${v===o.status?'selected':''}>${t}</option>`).join('')}</select></label></article>`).join('')||'<p>لا توجد طلبات حتى الآن.</p>'}</div>`;
  document.querySelectorAll('[data-order]').forEach(el=>el.onchange=async()=>{try{await api('/api/admin/order',{id:el.dataset.order,status:el.value});adminData.orders.find(o=>o.id===el.dataset.order).status=el.value;toast('تم تحديث الطلب.');}catch(err){toast(err.message);}});
}
function adminSettings(){
  const s=adminData.settings;
  $('#admin-content').innerHTML=`<form id="settings" class="panel"><h2>محتوى المتجر</h2><div class="forms">${[['name','اسم المتجر'],['headline','عنوان الصفحة الرئيسية'],['introduction','مقدمة المتجر'],['about','التعريف بالمتجر'],['delivery','التوصيل']].map(([key,label])=>`<label class="${key==='name'?'':'full'}">${label}<textarea name="${key}" required maxlength="5000">${esc(s[key])}</textarea></label>`).join('')}<label>العملة<select name="currency">${['DZD','EUR','USD','MAD','TND'].map(c=>`<option ${c===s.currency?'selected':''}>${c}</option>`).join('')}</select></label></div><button class="primary">حفظ الإعدادات</button></form>`;
  $('#settings').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await api('/api/admin/settings',Object.fromEntries(new FormData(e.target)));toast('تم حفظ الإعدادات.');await adminPage();}catch(err){toast(err.message);b.disabled=false;}};
  if(catalog.demo)$('#settings button').disabled=true;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.add)add(b.dataset.add);
  if(b.dataset.category){selected=b.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>el.classList.toggle('selected',el===b));cards();}
  if(b.dataset.remove){cart=cart.filter(i=>i.id!==b.dataset.remove);count();cartPage();}
  if(b.dataset.image)$('#gallery .product-art img').src='/'+b.dataset.image;
  if(b.dataset.edit){editing=adminData.products.find(p=>p.id===b.dataset.edit);images=[...editing.images];editor();}
  if(b.dataset.drop!==undefined){images.splice(Number(b.dataset.drop),1);previewImages();}
  if(b.dataset.tab){document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('selected',el===b));({products:adminProducts,orders:adminOrders,settings:adminSettings})[b.dataset.tab]();}
});
(async()=>{
  $('#year').textContent=new Date().getFullYear();count();
  try{
    if(location.pathname==='/admin'){catalog={settings:{currency:'DZD'}};await adminPage();return;}
    catalog=await api('/api/catalog');
    branding();
    if(catalog.demo){$('#notice').hidden=false;$('#notice').textContent='معاينة التصميم — المنتجات توضيحية، والطلبات والحفظ معطّلان حتى ربط المتجر.';}
    document.title=catalog.settings.name;
    if(location.pathname==='/about')about();else if(location.pathname==='/cart')cartPage();else if(location.pathname.startsWith('/product/'))detail();else home();
  }catch(err){$('#main').innerHTML=`<div class="empty"><h1>المتجر غير متاح مؤقتًا</h1><p>${esc(err.message)}</p><a href="/admin">دخول الإدارة</a></div>`;}
})();
