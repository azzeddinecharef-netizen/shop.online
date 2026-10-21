/**
 * Shop Online — Storefront Client Logic
 * Modern Arabic RTL Marketplace UI
 */

(function () {
  'use strict';

  // --- Helper Selectors & Utility Functions ---
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const esc = str => String(str ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  // Arabic Text Normalization for Search
  function normalizeArabic(text) {
    if (!text) return '';
    return String(text)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove tashkeel
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .toLowerCase()
      .trim();
  }

  // Currency Formatter
  function money(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('ar-DZ') + ' د.ج';
  }

  // Toast Notification
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3800);
  }

  // --- Baseline 5 Products (from Figma Specs) ---
  const BASELINE_PRODUCTS = [
    {
      id: 'demo-1',
      slug: 'everyday-headphones',
      name: 'سماعة لاسلكية فوق الأذن',
      category: 'إلكترونيات',
      subcategory: 'صوتيات وإلكترونيات',
      badge: 'اختيارنا من الإلكترونيات',
      subtitle: 'إيقاعك الخاص، أينما يأخذك اليوم.',
      price: 8900,
      stock: 8,
      rating: 4.8,
      reviewsCount: 126,
      status: 'active',
      images: ['images/headphones.jpg'],
      colors: [
        { name: 'أسود', hex: '#191C22' },
        { name: 'بيج', hex: '#EBE6DD' }
      ],
      description: 'سماعة رأس لاسلكية مريحة فوق الأذن بعزل صوتي ممتاز وصوت محيطي نقي. بطارية تدوم حتى 30 ساعة متواصلة مع وسائد أذن ناعمة مصممة للاستخدام اليومي المطول في العمل والسفر والاسترخاء.',
      deliveryText: 'توصيل متاح لـ 58 ولاية. الدفع عند الاستلام بعد معاينة المنتج والتأكد من جودته.'
    },
    {
      id: 'demo-2',
      slug: 'weekend-bag',
      name: 'حقيبة يومية',
      category: 'أكسسوارات',
      subcategory: 'حقائب وإكسسوارات',
      badge: 'الأكثر طلباً',
      subtitle: 'أناقة عملية ترافقك في كل مشاويرك.',
      price: 4200,
      stock: 12,
      rating: 4.7,
      reviewsCount: 89,
      status: 'active',
      images: ['images/bag.jpg'],
      colors: [
        { name: 'بني', hex: '#8B4513' },
        { name: 'أسود', hex: '#191C22' }
      ],
      description: 'حقيبة ظهر كلاسيكية من الجلد المتين مع مقصورة مخصصة للابتوب حتى 15 بوصة. خفيفة ومقاومة للاهتراء، توفر سعة ممتازة مع جيوب منظمة لأغراضك اليومية.',
      deliveryText: 'شحن سريع لجميع الولايات مع خيار فتح الطرد والمعاينة قبل الدفع.'
    },
    {
      id: 'demo-3',
      slug: 'desk-lamp',
      name: 'مصباح مكتبي',
      category: 'المنزل',
      subcategory: 'المنزل والإضاءة',
      badge: 'تصميم مميز',
      subtitle: 'إضاءة دافئة ومرنة لمكتبك وركن القراءة.',
      price: 3500,
      stock: 6,
      rating: 4.9,
      reviewsCount: 64,
      status: 'active',
      images: ['images/lamp.jpg'],
      colors: [
        { name: 'أبيض', hex: '#F5F5F5' },
        { name: 'وردي', hex: '#FAD2E1' }
      ],
      description: 'مصباح مكتبي بتصميم خشبي أنيق مع رأس إضاءة ناعم يمنع إجهاد العين. ذراع مفصلي قابل للتعديل بالكامل ليمنحك زاوية الإضاءة المثالية أثناء القراءة أو العمل الليلي.',
      deliveryText: 'تغليف آمن ومحمي بالكامل لضمان وصول المصباح سليمًا حتى باب منزلك.'
    },
    {
      id: 'demo-4',
      slug: 'white-sneakers',
      name: 'حذاء رياضي أبيض',
      category: 'أحذية',
      subcategory: 'أزياء وأحذية',
      badge: 'كلاسيكي متجدد',
      subtitle: 'راحة تدوم طوال اليوم بتصميم كلاسيكي عصري.',
      price: 6500,
      stock: 10,
      rating: 4.8,
      reviewsCount: 152,
      status: 'active',
      images: ['images/sneakers.jpg'],
      colors: [
        { name: 'أبيض', hex: '#FFFFFF' },
        { name: 'رمادي', hex: '#E0E0E0' }
      ],
      description: 'حذاء قماشي كلاسيكي بنعل مطاطي مرن ومريح لخطوات خفيفة طوال اليوم. يتناسب مع الإطلالات الرياضية والكاجوال اليومية بتصميم جذاب ومتين.',
      deliveryText: 'توصيل مع إمكانية تجربة المقاس عند الاستلام قبل تسليم المبلغ لمندوب التوصيل.'
    },
    {
      id: 'demo-5',
      slug: 'smart-watch',
      name: 'ساعة ذكية',
      category: 'ساعات وإكسسوارات',
      subcategory: 'ساعات وإكسسوارات',
      badge: 'أحدث إصدار',
      subtitle: 'تابع نشاطك وإشعاراتك بلمسة ذكية واحدة.',
      price: 5900,
      stock: 15,
      rating: 4.6,
      reviewsCount: 78,
      status: 'active',
      images: ['images/watch.jpg'],
      colors: [
        { name: 'زيتي', hex: '#2F4F4F' },
        { name: 'أسود', hex: '#191C22' }
      ],
      description: 'ساعة ذكية بشاشة لمس عالية الوضوح وحزام سيليكون ناعم. تتبع نبضات القلب والخطوات والنشاط الرياضي، مع استقبال إشعارات المكالمات والرسائل وبطارية تدوم لعدة أيام.',
      deliveryText: 'ضمان تشغيل وتأكيد مسبق للطلب عبر اتصال هاتفي مع فريق خدمة العملاء.'
    }
  ];

  // 58 Algerian Wilayas for Checkout
  const ALGERIA_WILAYAS = [
    '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
    '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
    '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
    '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
    '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
    '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
    '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
    '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
    '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
    '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
    '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - تقرت',
    '56 - جانت', '57 - المغير', '58 - المنيعة'
  ];

  // --- App State ---
  let catalog = {
    products: BASELINE_PRODUCTS,
    categories: ['إلكترونيات', 'أكسسوارات', 'المنزل', 'أحذية', 'ساعات وإكسسوارات'],
    settings: {
      name: 'Shop Online',
      headline: 'كل ما تحبّه. في مكان واحد.',
      introduction: 'اختيارات جديدة. كل يوم. من الإلكترونيات إلى تفاصيل المنزل، اكتشف اختيارات تناسبك وتناسب يومك.',
      about: 'متجر تسوق إلكتروني عصري يهدف لتقديم تجربة شراء مريحة وسريعة في الجزائر، مع ضمان الجودة وخدمة الدفع عند الاستلام.',
      delivery: 'توصيل متاح لكافة الولايات الـ 58. مدة التوصيل من 24 إلى 72 ساعة حسب الولاية. الدفع نقدًا عند استلام الطرد.',
      currency: 'DZD'
    },
    demo: true
  };

  let selectedCategory = 'الكل';
  let selectedSort = 'default';
  let searchQuery = '';
  let adminData = null;

  // LocalStorage Persisted Cart: [{ id, quantity, color }]
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('shop-cart') || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }

  // LocalStorage Persisted Favorites: [id]
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem('shop-favorites') || '[]');
    if (!Array.isArray(favorites)) favorites = [];
  } catch {
    favorites = [];
  }

  function saveCart() {
    localStorage.setItem('shop-cart', JSON.stringify(cart));
    updateBadges();
  }

  function saveFavorites() {
    localStorage.setItem('shop-favorites', JSON.stringify(favorites));
    updateBadges();
  }

  function updateBadges() {
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartBadge = $('#cart-badge');
    const cartLabel = $('#cart-label-count');
    const mobileCartBadge = $('#mobile-cart-badge');

    if (cartBadge) cartBadge.textContent = totalCount;
    if (cartLabel) cartLabel.textContent = totalCount;
    if (mobileCartBadge) mobileCartBadge.textContent = totalCount;

    const favCount = favorites.length;
    const favBadge = $('#fav-badge');
    const mobileFavBadge = $('#mobile-fav-badge');

    if (favBadge) {
      favBadge.textContent = favCount;
      favBadge.hidden = favCount === 0;
    }
    if (mobileFavBadge) {
      mobileFavBadge.textContent = favCount;
      mobileFavBadge.hidden = favCount === 0;
    }
  }

  // API Client
  async function api(path, data) {
    const isPost = data !== undefined;
    const res = await fetch(path, {
      method: isPost ? 'POST' : 'GET',
      headers: isPost ? { 'Content-Type': 'application/json' } : {},
      body: isPost ? JSON.stringify(data) : undefined
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'تعذر إتمام العملية.');
    return result;
  }

  // Add to Cart
  function addToCart(productId, quantity = 1, color = null) {
    const product = catalog.products.find(p => p.id === productId);
    if (!product) return;

    const chosenColor = color || (product.colors && product.colors[0] ? product.colors[0].name : '');
    const existing = cart.find(item => item.id === productId && item.color === chosenColor);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: productId, quantity, color: chosenColor });
    }

    saveCart();
    toast(`أُضيف "${product.name}" إلى السلة.`);
  }

  // Toggle Favorite
  function toggleFavorite(productId) {
    const idx = favorites.indexOf(productId);
    if (idx > -1) {
      favorites.splice(idx, 1);
      toast('تمت الإزالة من المفضلة.');
    } else {
      favorites.push(productId);
      toast('أُضيف المنتج إلى المفضلة.');
    }
    saveFavorites();
    // Refresh cards state
    $$(`.card-fav-btn[data-id="${productId}"]`).forEach(btn => {
      btn.classList.toggle('is-fav', favorites.includes(productId));
    });
    const detailFavBtn = $('#detail-fav-btn');
    if (detailFavBtn && detailFavBtn.dataset.id === productId) {
      detailFavBtn.classList.toggle('is-fav', favorites.includes(productId));
      detailFavBtn.innerHTML = favorites.includes(productId) ? 'محفوظ في المفضلة ♥' : 'حفظ للمفضلة ♡';
    }
  }

  // --- Render Views ---

  // 1. Homepage View
  function renderHome() {
    const main = $('#main');
    if (!main) return;

    main.innerHTML = `
      <!-- Hero Area -->
      <section class="hero-grid" aria-label="أبرز العروض">
        <!-- Main Hero Card -->
        <article class="hero-main-card">
          <div class="hero-text-side">
            <span class="hero-tag">أشياء جديدة تستحق الاكتشاف</span>
            <h1 class="hero-title">كل ما تحبّه.<br>في مكان واحد.</h1>
            <p class="hero-subtitle">اختيارات جديدة. كل يوم. من الإلكترونيات إلى تفاصيل المنزل، اكتشف اختيارات تناسبك وتناسب يومك.</p>
            <a href="#collection" class="btn-primary" id="hero-cta-btn">
              <span>اكتشف الاختيارات</span>
              <span aria-hidden="true">←</span>
            </a>
          </div>
          <div class="hero-image-wrap">
            <img src="/images/headphones.jpg" alt="سماعة لاسلكية" loading="eager">
          </div>
        </article>

        <!-- Secondary Side Card (Desktop) -->
        <article class="hero-side-card">
          <div>
            <span class="hero-side-tag">اختيارات يومية</span>
            <h2 class="hero-side-title">تفاصيل تحبّها</h2>
          </div>
          <div class="hero-side-image">
            <img src="/images/watch.jpg" alt="ساعة ذكية" loading="lazy">
          </div>
          <a href="/?category=ساعات وإكسسوارات" class="hero-side-link">
            <span>اكتشف الإكسسوارات</span>
            <span aria-hidden="true">←</span>
          </a>
        </article>
      </section>

      <!-- Value Props Strip -->
      <section class="features-strip" aria-label="مزايا التسوق معنا">
        <div class="feature-item">
          <div class="feature-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div>
            <div class="feature-title">الدفع عند الاستلام</div>
            <div class="feature-desc">وتأكيد الطلب معك خطوة بخطوة</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
          </div>
          <div>
            <div class="feature-title">أسعار بالدينار</div>
            <div class="feature-desc">ميزانية واضحة بدون رسوم خفية</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </div>
          <div>
            <div class="feature-title">تواصل مباشر</div>
            <div class="feature-desc">فريق جاهز لمساعدتك في الاختيار</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <div>
            <div class="feature-title">اختيارات متنوعة</div>
            <div class="feature-desc">لكل يوم، ولكل ذوق</div>
          </div>
        </div>
      </section>

      <!-- Category Navigation ("ابدأ من هنا") -->
      <section id="categories" class="categories-section" aria-label="الأقسام الرئيسية">
        <div class="section-header-row">
          <h2 class="section-heading">ابدأ من هنا</h2>
          <a href="#collection" class="section-link" id="view-all-cats-link">
            <span>جميع الأقسام</span>
            <span aria-hidden="true">←</span>
          </a>
        </div>
        <div class="categories-grid" id="home-categories-grid">
          <!-- Rendered via renderCategoriesGrid() -->
        </div>
      </section>

      <!-- Featured Products Grid ("مختارات تستحق الاكتشاف") -->
      <section id="collection" class="products-section" aria-label="المنتجات المميزة">
        <div class="section-header-row">
          <h2 class="section-heading">مختارات تستحق الاكتشاف</h2>
          <button type="button" class="section-link" id="reset-filters-btn">
            <span>عرض الكل</span>
            <span aria-hidden="true">←</span>
          </button>
        </div>

        <!-- Filter & Sort Bar -->
        <div class="filter-sort-bar">
          <div class="filter-chips" id="filter-chips">
            <!-- Chips rendered dynamically -->
          </div>
          <div class="sort-select-wrap">
            <label for="product-sort-select">الترتيب:</label>
            <select id="product-sort-select" class="sort-select">
              <option value="default">المقترحة</option>
              <option value="newest">وصل حديثًا</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييمًا</option>
            </select>
          </div>
        </div>

        <!-- Products Grid Container -->
        <div class="products-grid" id="products-grid-container">
          <!-- Rendered via renderProductsGrid() -->
        </div>
      </section>

      <!-- Promo Mid-Page Banner -->
      <section class="promo-banner" aria-label="قسم خاص">
        <div>
          <h2 class="promo-title">مساحتك، على ذوقك.</h2>
          <p class="promo-desc">تفاصيل بسيطة تضيف الدفء والأناقة إلى كل زاوية في منزلك ومكتبك.</p>
        </div>
        <a href="/?category=المنزل" class="btn-white">
          <span>اكتشف عالم المنزل</span>
        </a>
      </section>
    `;

    renderCategoriesGrid();
    renderFilterChips();
    renderProductsGrid();
    setupHomeEvents();
  }

  function renderCategoriesGrid() {
    const container = $('#home-categories-grid');
    if (!container) return;

    const cats = [
      { name: 'إلكترونيات', icon: 'headphones' },
      { name: 'أزياء وحقائب', filter: 'أكسسوارات', icon: 'bag' },
      { name: 'المنزل', icon: 'lamp' },
      { name: 'أحذية', icon: 'shoe' },
      { name: 'ساعات وإكسسوارات', icon: 'watch' }
    ];

    const iconSvgs = {
      headphones: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
      bag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
      lamp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>',
      shoe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14l6-6 4 4 6-6"></path><path d="M2 18h20v2H2z"></path></svg>',
      watch: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path></svg>'
    };

    container.innerHTML = cats.map(c => `
      <div class="category-card ${selectedCategory === (c.filter || c.name) ? 'active' : ''}" data-category-choice="${esc(c.filter || c.name)}">
        <span class="cat-info-name">${esc(c.name)}</span>
        <div class="cat-icon-container" aria-hidden="true">
          ${iconSvgs[c.icon] || ''}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.category-card').forEach(card => {
      card.onclick = () => {
        selectedCategory = card.dataset.categoryChoice;
        renderFilterChips();
        renderProductsGrid();
        const col = $('#collection');
        if (col) col.scrollIntoView({ behavior: 'smooth' });
      };
    });
  }

  function renderFilterChips() {
    const container = $('#filter-chips');
    if (!container) return;

    const allCategories = ['الكل', ...catalog.categories];
    container.innerHTML = allCategories.map(cat => `
      <button type="button" class="chip-btn ${selectedCategory === cat ? 'active' : ''}" data-cat="${esc(cat)}">
        ${esc(cat)}
      </button>
    `).join('');

    container.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        selectedCategory = btn.dataset.cat;
        renderFilterChips();
        renderProductsGrid();
      };
    });
  }

  function getFilteredProducts() {
    let list = [...catalog.products];

    // Filter by category
    if (selectedCategory !== 'الكل') {
      const normCat = normalizeArabic(selectedCategory);
      list = list.filter(p =>
        normalizeArabic(p.category).includes(normCat) ||
        normalizeArabic(p.subcategory || '').includes(normCat)
      );
    }

    // Filter by search query with Arabic text normalization
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      list = list.filter(p =>
        normalizeArabic(p.name).includes(q) ||
        normalizeArabic(p.description).includes(q) ||
        normalizeArabic(p.category).includes(q) ||
        normalizeArabic(p.subcategory || '').includes(q)
      );
    }

    // Sort
    if (selectedSort === 'newest') {
      list.reverse();
    } else if (selectedSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }

  function renderProductsGrid() {
    const container = $('#products-grid-container');
    if (!container) return;

    const list = getFilteredProducts();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state-view" style="grid-column: 1 / -1;">
          <div class="empty-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 class="empty-title">لا توجد منتجات مطابقة للبحث</h3>
          <p class="empty-subtitle">جرّب البحث بكلمة أخرى أو تصفح باقي الأقسام.</p>
          <button type="button" class="btn-primary" id="clear-search-btn">عرض كل المنتجات</button>
        </div>
      `;
      const clearBtn = $('#clear-search-btn');
      if (clearBtn) {
        clearBtn.onclick = () => {
          searchQuery = '';
          selectedCategory = 'الكل';
          const s1 = $('#site-search-input');
          const s2 = $('#mobile-search-input');
          if (s1) s1.value = '';
          if (s2) s2.value = '';
          renderFilterChips();
          renderProductsGrid();
        };
      }
      return;
    }

    container.innerHTML = list.map(p => {
      const isFav = favorites.includes(p.id);
      const imgPath = (p.images && p.images[0]) ? `/${p.images[0]}` : '/images/headphones.jpg';

      return `
        <article class="product-card" data-slug="${esc(p.slug)}">
          <div class="card-img-wrap">
            <a href="/product/${encodeURIComponent(p.slug)}" class="card-link" aria-label="${esc(p.name)}">
              <img src="${esc(imgPath)}" alt="${esc(p.name)}" loading="lazy">
            </a>
            <button type="button" class="card-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${esc(p.id)}" aria-label="حفظ في المفضلة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="card-content">
            <span class="card-category">${esc(p.subcategory || p.category)}</span>
            <a href="/product/${encodeURIComponent(p.slug)}">
              <h3 class="card-title">${esc(p.name)}</h3>
            </a>

            <div class="card-price-row">
              <span class="card-price">${money(p.price)}</span>
              <span class="card-rating">
                <span class="star-icon">★</span>
                <span>${p.rating || 4.8}</span>
              </span>
            </div>

            <div class="card-footer-meta">
              <span class="card-cod-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <span>الدفع عند الاستلام</span>
              </span>
              <button type="button" class="card-quick-add" data-add-id="${esc(p.id)}" aria-label="إضافة سريعة إلى السلة">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    container.querySelectorAll('[data-fav-id]').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      };
    });

    container.querySelectorAll('[data-add-id]').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(btn.dataset.addId, 1);
      };
    });
  }

  function setupHomeEvents() {
    const sortSelect = $('#product-sort-select');
    if (sortSelect) {
      sortSelect.value = selectedSort;
      sortSelect.onchange = e => {
        selectedSort = e.target.value;
        renderProductsGrid();
      };
    }

    const resetBtn = $('#reset-filters-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        selectedCategory = 'الكل';
        selectedSort = 'default';
        searchQuery = '';
        const s1 = $('#site-search-input');
        const s2 = $('#mobile-search-input');
        if (s1) s1.value = '';
        if (s2) s2.value = '';
        if (sortSelect) sortSelect.value = 'default';
        renderFilterChips();
        renderProductsGrid();
      };
    }
  }

  // 2. Product Detail View
  function renderDetail(slug) {
    const main = $('#main');
    if (!main) return;

    const product = catalog.products.find(p => p.slug === slug);
    if (!product) {
      main.innerHTML = `
        <div class="empty-state-view">
          <h2 class="empty-title">المنتج غير متوفر</h2>
          <p class="empty-subtitle">المنتج الذي تبحث عنه قد يكون تم حذفه أو تم تغيير رابطه.</p>
          <a href="/" class="btn-primary">العودة للرئيسية</a>
        </div>
      `;
      return;
    }

    document.title = `${product.name} | ${catalog.settings.name}`;

    let selectedColor = product.colors && product.colors[0] ? product.colors[0].name : '';
    let quantity = 1;
    const isFav = favorites.includes(product.id);
    const mainImg = (product.images && product.images[0]) ? `/${product.images[0]}` : '/images/headphones.jpg';

    // Related products (exclude current)
    const related = catalog.products.filter(p => p.id !== product.id).slice(0, 5);

    main.innerHTML = `
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav" aria-label="مسار التصفح">
        <a href="/">الرئيسية</a>
        <span class="breadcrumb-separator">/</span>
        <a href="/?category=${encodeURIComponent(product.category)}">${esc(product.category)}</a>
        <span class="breadcrumb-separator">/</span>
        <span aria-current="page">${esc(product.name)}</span>
      </nav>

      <!-- Main Layout -->
      <section class="product-detail-layout">
        <!-- Gallery Side -->
        <div class="gallery-side">
          <div class="main-gallery-view">
            <img id="detail-main-img" src="${esc(mainImg)}" alt="${esc(product.name)}">
          </div>
          <div class="thumbnails-row">
            <div class="thumb-item active" data-img-src="${esc(mainImg)}">
              <img src="${esc(mainImg)}" alt="${esc(product.name)}">
            </div>
            <div class="thumb-caption">
              <strong>نظرة أقرب إلى اختيارك</strong>
              <span>صورة توضيحية للمنتج</span>
            </div>
          </div>
        </div>

        <!-- Info Side -->
        <div class="product-info-side">
          <span class="badge-tag">${esc(product.badge || 'اختيارنا')}</span>
          <h1 class="detail-title">${esc(product.name)}</h1>
          <p class="detail-subtitle">${esc(product.subtitle || 'إيقاعك الخاص، أينما يأخذك اليوم.')}</p>

          <div class="detail-rating-row">
            <span class="stars-group">★★★★★</span>
            <span class="rating-score">${product.rating || 4.8}</span>
            <span class="reviews-count">(${product.reviewsCount || 126} تقييمًا)</span>
          </div>

          <div class="detail-price-box">
            <span class="price-meta">السعر قبل التوصيل</span>
            <div class="detail-price">${money(product.price)}</div>
          </div>

          <!-- Color Selector -->
          ${product.colors && product.colors.length ? `
            <div class="option-group">
              <span class="option-label" id="color-label">اللون: <strong>${esc(selectedColor)}</strong></span>
              <div class="color-pills-row" id="color-pills">
                ${product.colors.map((c, i) => `
                  <button type="button" class="color-pill ${i === 0 ? 'active' : ''}" data-color-name="${esc(c.name)}">
                    <span class="color-swatch-dot" style="background-color: ${esc(c.hex)};"></span>
                    <span>${esc(c.name)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Quantity Stepper -->
          <div class="quantity-stock-row">
            <div class="qty-stepper">
              <button type="button" class="qty-btn" id="qty-minus" aria-label="تقليل الكمية">−</button>
              <input type="text" class="qty-input" id="qty-value" value="1" readonly aria-label="الكمية">
              <button type="button" class="qty-btn" id="qty-plus" aria-label="زيادة الكمية">+</button>
            </div>
            <span class="stock-status">● متاح للطلب (${product.stock} قطع في المخزون)</span>
          </div>

          <!-- Action Buttons -->
          <div class="cta-actions-row">
            <button type="button" class="btn-primary btn-add-cart" id="detail-add-cart-btn">
              <span>أضف إلى السلة</span>
            </button>
            <button type="button" class="btn-secondary-fav ${isFav ? 'is-fav' : ''}" id="detail-fav-btn" data-id="${esc(product.id)}">
              <span>${isFav ? 'محفوظ في المفضلة ♥' : 'حفظ للمفضلة ♡'}</span>
            </button>
          </div>

          <!-- COD & Delivery Reassurance -->
          <div class="cod-assurance-card">
            <div class="cod-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span>الدفع عند الاستلام نقداً</span>
            </div>
            <div class="cod-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>تكلفة التوصيل تُحدّد عند تأكيد الطلب حسب الولاية</span>
            </div>
            <p class="cod-note">نتواصل معك عبر الهاتف لتأكيد تفاصيل الطلب والعنوان قبل الشحن.</p>
          </div>
        </div>
      </section>

      <!-- Tabs Section -->
      <section class="detail-tabs-section" aria-label="تفاصيل إضافية">
        <div class="tabs-nav-bar">
          <button type="button" class="tab-nav-btn active" data-tab="desc">عن المنتج</button>
          <button type="button" class="tab-nav-btn" data-tab="delivery">التوصيل والدفع</button>
          <button type="button" class="tab-nav-btn" data-tab="reviews">آراء العملاء (${product.reviewsCount || 126})</button>
        </div>

        <div class="tab-panel-body" id="tab-panel-body">
          <h3>تفاصيل تناسب أسلوبك</h3>
          <p>${esc(product.description)}</p>
        </div>
      </section>

      <!-- Related Products -->
      <section class="related-section" aria-label="منتجات قد تعجبك">
        <div class="section-header-row">
          <h2 class="section-heading">قد تعجبك أيضًا</h2>
          <a href="/#collection" class="section-link">
            <span>عرض الكل</span>
            <span aria-hidden="true">←</span>
          </a>
        </div>
        <div class="products-grid">
          ${related.map(p => {
            const relFav = favorites.includes(p.id);
            const rImg = (p.images && p.images[0]) ? `/${p.images[0]}` : '/images/headphones.jpg';
            return `
              <article class="product-card">
                <div class="card-img-wrap">
                  <a href="/product/${encodeURIComponent(p.slug)}">
                    <img src="${esc(rImg)}" alt="${esc(p.name)}" loading="lazy">
                  </a>
                  <button type="button" class="card-fav-btn ${relFav ? 'is-fav' : ''}" data-fav-id="${esc(p.id)}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${relFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div class="card-content">
                  <span class="card-category">${esc(p.subcategory || p.category)}</span>
                  <a href="/product/${encodeURIComponent(p.slug)}">
                    <h3 class="card-title">${esc(p.name)}</h3>
                  </a>
                  <div class="card-price-row">
                    <span class="card-price">${money(p.price)}</span>
                    <span class="card-rating">★ ${p.rating || 4.8}</span>
                  </div>
                  <div class="card-footer-meta">
                    <span class="card-cod-tag">الدفع عند الاستلام</span>
                    <button type="button" class="card-quick-add" data-add-id="${esc(p.id)}" aria-label="إضافة سريعة">＋</button>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;

    // Interactive Quantity
    const qtyInput = $('#qty-value');
    const plusBtn = $('#qty-plus');
    const minusBtn = $('#qty-minus');

    if (plusBtn && minusBtn && qtyInput) {
      plusBtn.onclick = () => {
        if (quantity < product.stock) {
          quantity++;
          qtyInput.value = quantity;
        } else {
          toast('وصلت إلى الحد الأقصى للمخزون المتوفر.');
        }
      };
      minusBtn.onclick = () => {
        if (quantity > 1) {
          quantity--;
          qtyInput.value = quantity;
        }
      };
    }

    // Color Selector
    $$('#color-pills .color-pill').forEach(btn => {
      btn.onclick = () => {
        $$('#color-pills .color-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.colorName;
        const lbl = $('#color-label strong');
        if (lbl) lbl.textContent = selectedColor;
      };
    });

    // Add to Cart CTA
    const addBtn = $('#detail-add-cart-btn');
    if (addBtn) {
      addBtn.onclick = () => {
        addToCart(product.id, quantity, selectedColor);
      };
    }

    // Favorite CTA
    const favBtn = $('#detail-fav-btn');
    if (favBtn) {
      favBtn.onclick = () => {
        toggleFavorite(product.id);
      };
    }

    // Tabs Switcher
    const tabData = {
      desc: {
        title: 'تفاصيل تناسب أسلوبك',
        body: esc(product.description)
      },
      delivery: {
        title: 'معلومات الشحن والدفع عند الاستلام',
        body: `
          <p><strong>طريقة الدفع:</strong> الدفع نقدًا عند الاستلام بعد معاينة المنتج وفحصه.</p>
          <br>
          <p><strong>مدة التوصيل:</strong> من 24 إلى 48 ساعة للجزائر العاصمة والولايات الكبرى، ومن 48 إلى 72 ساعة لباقي الولايات الـ 58.</p>
          <br>
          <p><strong>تأكيد الطلب:</strong> بعد إرسال الطلب، يتصل بك أحد مسؤولي خدمة العملاء لتأكيد العنوان وموعد التوصيل المناسب لك.</p>
        `
      },
      reviews: {
        title: `تقييمات المشترين (${product.reviewsCount || 126})`,
        body: `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <span style="font-size:32px; font-weight:800; color:var(--text-ink);">4.8</span>
            <div>
              <div style="color:var(--star-gold); font-size:18px;">★★★★★</div>
              <small style="color:var(--text-muted);">بناءً على 126 تقييمًا موثقًا من مشترين حقيقيين</small>
            </div>
          </div>
          <p>• <strong>أمين ب. (الجزائر العاصمة):</strong> "المنتج أصلي وممتاز، والتوصيل كان سريع في أقل من 24 ساعة. شكراً لكم!"</p>
          <br>
          <p>• <strong>فاطمة الزهراء (وهران):</strong> "جودة رائعة والدفع عند الاستلام يعطي ثقة كبيرة في الشراء."</p>
        `
      }
    };

    $$('.tab-nav-btn').forEach(btn => {
      btn.onclick = () => {
        $$('.tab-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const data = tabData[btn.dataset.tab];
        if (data) {
          $('#tab-panel-body').innerHTML = `
            <h3>${data.title}</h3>
            <div>${data.body}</div>
          `;
        }
      };
    });

    // Related cards events
    $$('.related-section [data-fav-id]').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      };
    });
    $$('.related-section [data-add-id]').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(btn.dataset.addId, 1);
      };
    });
  }

  // 3. Cart View
  function renderCart() {
    const main = $('#main');
    if (!main) return;

    document.title = `سلة التسوق | ${catalog.settings.name}`;

    const items = cart.map(item => {
      const p = catalog.products.find(prod => prod.id === item.id);
      return { ...item, product: p };
    }).filter(i => i.product);

    if (items.length === 0) {
      main.innerHTML = `
        <div class="empty-state-view">
          <div class="empty-icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2 class="empty-title">سلتك فارغة حاليًا</h2>
          <p class="empty-subtitle">اختياراتك الجميلة في مكان واحد. تصفح أحدث المنتجات وأضف ما تحبّه إلى سلتك.</p>
          <a href="/" class="btn-primary">ابدأ التسوق الآن</a>
        </div>
      `;
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    main.innerHTML = `
      <div class="cart-title-row">
        <div>
          <h1 class="cart-heading-title">سلة التسوق</h1>
          <span class="cart-heading-meta">اختياراتك الجميلة في مكان واحد · ${totalItemsCount} ${totalItemsCount === 1 ? 'منتج' : 'منتجات'}</span>
        </div>
        <a href="/" class="btn-continue-shopping">متابعة التسوق</a>
      </div>

      <!-- Checkout Stepper -->
      <div class="checkout-stepper" aria-label="مراحل إتمام الطلب">
        <div class="step-item active">
          <span class="step-num">1</span>
          <span>سلة التسوق</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <span class="step-num">2</span>
          <span>بيانات التوصيل</span>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <span class="step-num">3</span>
          <span>تأكيد الطلب</span>
        </div>
      </div>

      <!-- Cart Main Grid -->
      <div class="cart-layout">
        <!-- Items Column -->
        <div class="cart-items-column">
          <div class="cart-items-list">
            ${items.map(item => {
              const p = item.product;
              const img = (p.images && p.images[0]) ? `/${p.images[0]}` : '/images/headphones.jpg';
              return `
                <div class="cart-item-card" data-cart-id="${esc(item.id)}" data-cart-color="${esc(item.color || '')}">
                  <div class="cart-item-img">
                    <img src="${esc(img)}" alt="${esc(p.name)}">
                  </div>
                  <div class="cart-item-details">
                    <span class="cart-item-category">${esc(p.subcategory || p.category)}</span>
                    <h3 class="cart-item-name">${esc(p.name)}</h3>
                    ${item.color ? `<span class="cart-item-color">اللون: ${esc(item.color)}</span>` : ''}
                  </div>
                  <div class="cart-item-actions">
                    <div class="cart-item-price">${money(p.price * item.quantity)}</div>
                    <div class="qty-stepper">
                      <button type="button" class="qty-btn" data-qty-dec="${esc(item.id)}" data-color="${esc(item.color || '')}">−</button>
                      <input type="text" class="qty-input" value="${item.quantity}" readonly>
                      <button type="button" class="qty-btn" data-qty-inc="${esc(item.id)}" data-color="${esc(item.color || '')}">+</button>
                    </div>
                    <button type="button" class="btn-remove-item" data-remove-id="${esc(item.id)}" data-color="${esc(item.color || '')}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Reassurance Strip -->
          <div class="cod-assurance-card" style="background:#EAF7EE; border-color:#C3E6CB;">
            <div class="cod-row" style="color:#155724;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span><strong>الدفع عند الاستلام</strong> — يتم تأكيد الطلب وتفاصيل التوصيل معك هاتفيًا قبل الإرسال.</span>
            </div>
          </div>
        </div>

        <!-- Summary Column -->
        <aside class="order-summary-card">
          <h2 class="summary-heading">ملخّص الطلب</h2>

          <div class="summary-row">
            <span>المجموع الفرعي (${totalItemsCount} منتجات)</span>
            <span style="font-weight:700; direction:ltr;">${money(subtotal)}</span>
          </div>

          <div class="summary-row">
            <span>تكلفة التوصيل</span>
            <span style="color:var(--text-muted); font-size:13px;">يُحدّد عند تأكيد الطلب</span>
          </div>

          <div class="summary-row total-row">
            <div>
              <span class="total-label" style="font-weight:700; font-size:16px;">الإجمالي</span>
              <span class="total-meta">قبل إضافة تكلفة التوصيل</span>
            </div>
            <div class="total-amount">${money(subtotal)}</div>
          </div>

          <button type="button" class="btn-primary btn-checkout-submit" id="proceed-checkout-btn">
            <span>متابعة بيانات التوصيل</span>
            <span aria-hidden="true">←</span>
          </button>

          <div class="summary-trust-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28A745" stroke-width="2" style="flex-shrink:0;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>سنراجع بياناتك قبل إرسال الطلب. نتواصل معك لتأكيد التوصيل والمبلغ النهائي.</span>
          </div>
        </aside>
      </div>
    `;

    // Attach Cart Action Listeners
    $$('[data-qty-inc]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.qtyInc;
        const color = btn.dataset.color;
        const itm = cart.find(i => i.id === id && (i.color || '') === color);
        if (itm) {
          itm.quantity++;
          saveCart();
          renderCart();
        }
      };
    });

    $$('[data-qty-dec]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.qtyDec;
        const color = btn.dataset.color;
        const itm = cart.find(i => i.id === id && (i.color || '') === color);
        if (itm) {
          if (itm.quantity > 1) {
            itm.quantity--;
          } else {
            cart = cart.filter(i => !(i.id === id && (i.color || '') === color));
          }
          saveCart();
          renderCart();
        }
      };
    });

    $$('[data-remove-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.removeId;
        const color = btn.dataset.color;
        cart = cart.filter(i => !(i.id === id && (i.color || '') === color));
        saveCart();
        toast('تم حذف المنتج من السلة.');
        renderCart();
      };
    });

    const proceedBtn = $('#proceed-checkout-btn');
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        openCheckoutModal(subtotal);
      };
    }
  }

  // 4. Checkout Modal (Strict Demo Mode)
  function openCheckoutModal(subtotal) {
    const backdrop = $('#modal-backdrop');
    const body = $('#modal-body');
    if (!backdrop || !body) return;

    body.innerHTML = `
      <div style="margin-bottom:20px;">
        <span class="hero-tag">إتمام الطلب</span>
        <h2 style="font-size:24px; font-weight:800; color:var(--text-ink); margin-top:4px;">بيانات التوصيل</h2>
      </div>

      <!-- DEMO MODE NOTICE (Explicit Requirement) -->
      <div class="checkout-demo-alert">
        <strong>تنبيه: المتجر في وضع المعاينة التجريبي (DEMO MODE)</strong>
        <p style="margin-top:4px;">استقبال الطلبات الفعلية معطل حالياً. النموذج أدناه للتجربة والمعاينة فقط، ولن يتم خصم أي مبالغ أو إرسال طلبات حقيقية.</p>
      </div>

      <form id="checkout-demo-form">
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label" for="order-name">الاسم الكامل *</label>
            <input type="text" id="order-name" class="form-input" required placeholder="مثال: محمد بن علي">
          </div>

          <div class="form-group">
            <label class="form-label" for="order-phone">رقم الهاتف *</label>
            <input type="tel" id="order-phone" class="form-input" required placeholder="05 / 06 / 07 XX XX XX XX">
          </div>

          <div class="form-group">
            <label class="form-label" for="order-wilaya">الولاية *</label>
            <select id="order-wilaya" class="form-select" required>
              <option value="">اختر ولايتك...</option>
              ${ALGERIA_WILAYAS.map(w => `<option value="${esc(w)}">${esc(w)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="order-address">العنوان أو البلدية *</label>
            <textarea id="order-address" class="form-textarea" required placeholder="اسم البلدية، الحي، والشارع..."></textarea>
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="order-notes">ملاحظات للمندوب (اختياري)</label>
            <input type="text" id="order-notes" class="form-input" placeholder="مثال: الاتصال قبل الوصول بنصف ساعة">
          </div>
        </div>

        <div style="background:var(--bg-canvas); border-radius:var(--radius-sm); padding:16px; margin:20px 0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700;">المبلغ المطلوب دفعه عند الاستلام:</span>
          <span style="font-size:20px; font-weight:800; color:var(--text-ink);">${money(subtotal)}</span>
        </div>

        <button type="submit" class="btn-primary" style="width:100%; padding:14px; font-size:16px;">
          <span>تأكيد طلب المعاينة (تجريبي)</span>
        </button>
      </form>
    `;

    backdrop.hidden = false;

    const closeBtn = $('#modal-close');
    if (closeBtn) closeBtn.onclick = () => { backdrop.hidden = true; };
    backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };

    const form = $('#checkout-demo-form');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const customerName = $('#order-name').value;
        const wilaya = $('#order-wilaya').value;
        const fakeOrderId = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);

        // Show Demo Success Modal
        body.innerHTML = `
          <div style="text-align:center; padding:10px 0;">
            <div style="width:64px; height:64px; background:#EAF7EE; color:#28A745; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style="font-size:24px; font-weight:800; color:var(--text-ink); margin-bottom:8px;">تم تسجيل طلب المعاينة بنجاح!</h2>
            <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px;">
              شكراً لك يا <strong>${esc(customerName)}</strong> (${esc(wilaya)}).<br>
              رقم طلب المعاينة هو: <strong>${fakeOrderId}</strong>
            </p>
            <div style="background:#FFF3CD; border:1px solid #FFEEBA; border-radius:var(--radius-sm); padding:12px; font-size:13px; color:#856404; margin-bottom:24px;">
              تذكير: لم يتم إرسال طلب حقيقي إلى المتجر لأن النظام يعمل في وضع المعاينة التجريبي (DEMO).
            </div>
            <button type="button" class="btn-primary" id="finish-demo-order-btn" style="width:100%;">
              <span>العودة للمتجر</span>
            </button>
          </div>
        `;

        // Clear cart for clean UX
        cart = [];
        saveCart();

        $('#finish-demo-order-btn').onclick = () => {
          backdrop.hidden = true;
          navigate('/');
        };
      };
    }
  }

  // 5. Favorites View
  function renderFavorites() {
    const main = $('#main');
    if (!main) return;

    document.title = `المفضلة | ${catalog.settings.name}`;

    const favProducts = catalog.products.filter(p => favorites.includes(p.id));

    if (favProducts.length === 0) {
      main.innerHTML = `
        <div class="empty-state-view">
          <div class="empty-icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 class="empty-title">قائمة المفضلة فارغة</h2>
          <p class="empty-subtitle">احفظ المنتجات التي تعجبك بالضغط على زر القلب لتعود إليها في أي وقت.</p>
          <a href="/" class="btn-primary">استكشف المنتجات</a>
        </div>
      `;
      return;
    }

    main.innerHTML = `
      <div class="section-header-row" style="margin-bottom:24px;">
        <div>
          <h1 class="section-heading">قائمة المفضلة</h1>
          <p class="cart-heading-meta">المنتجات التي قمت بحفظها (${favProducts.length} منتجات)</p>
        </div>
        <button type="button" class="btn-continue-shopping" id="clear-all-favs">إفراغ المفضلة</button>
      </div>

      <div class="products-grid">
        ${favProducts.map(p => {
          const img = (p.images && p.images[0]) ? `/${p.images[0]}` : '/images/headphones.jpg';
          return `
            <article class="product-card">
              <div class="card-img-wrap">
                <a href="/product/${encodeURIComponent(p.slug)}">
                  <img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy">
                </a>
                <button type="button" class="card-fav-btn is-fav" data-fav-id="${esc(p.id)}" aria-label="إزالة من المفضلة">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              <div class="card-content">
                <span class="card-category">${esc(p.subcategory || p.category)}</span>
                <a href="/product/${encodeURIComponent(p.slug)}">
                  <h3 class="card-title">${esc(p.name)}</h3>
                </a>
                <div class="card-price-row">
                  <span class="card-price">${money(p.price)}</span>
                  <span class="card-rating">★ ${p.rating || 4.8}</span>
                </div>
                <div class="card-footer-meta">
                  <span class="card-cod-tag">الدفع عند الاستلام</span>
                  <button type="button" class="card-quick-add" data-add-id="${esc(p.id)}" aria-label="أضف إلى السلة">＋</button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    $$('.products-grid [data-fav-id]').forEach(btn => {
      btn.onclick = () => {
        toggleFavorite(btn.dataset.favId);
        renderFavorites();
      };
    });

    $$('.products-grid [data-add-id]').forEach(btn => {
      btn.onclick = () => {
        addToCart(btn.dataset.addId, 1);
      };
    });

    const clearBtn = $('#clear-all-favs');
    if (clearBtn) {
      clearBtn.onclick = () => {
        favorites = [];
        saveFavorites();
        renderFavorites();
      };
    }
  }

  // 6. About Page View
  function renderAbout() {
    const main = $('#main');
    if (!main) return;

    document.title = `عن المتجر | ${catalog.settings.name}`;

    main.innerHTML = `
      <div class="page-container-narrow">
        <article class="page-card">
          <span class="hero-tag">OUR STORY / عن المتجر</span>
          <h1 class="page-header-title">${esc(catalog.settings.name)}</h1>
          <p class="page-header-desc">${esc(catalog.settings.about)}</p>

          <div style="background:var(--bg-canvas); border-radius:var(--radius-md); padding:24px; margin-bottom:28px;">
            <h3 style="font-size:18px; font-weight:800; margin-bottom:10px;">كيف تطلب من متجرنا؟</h3>
            <p style="font-size:14px; color:var(--text-muted); line-height:1.7;">
              اختر منتجاتك المفضلة وأضفها إلى السلة، ثم أدخل اسمك ورقم هاتفك وعنوانك.
              سيتصل بك فريقنا لتأكيد توفر المنتج وموعد التوصيل، والدفع يكون نقدًا عند استلام الطرد ومعاينته.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:32px;">
            <div style="text-align:center; padding:18px; border:1px solid var(--line-border); border-radius:var(--radius-sm);">
              <div style="font-size:24px; font-weight:800; color:var(--accent-action);">58</div>
              <div style="font-size:13px; font-weight:700;">ولاية مغطاة</div>
            </div>
            <div style="text-align:center; padding:18px; border:1px solid var(--line-border); border-radius:var(--radius-sm);">
              <div style="font-size:24px; font-weight:800; color:var(--accent-action);">100%</div>
              <div style="font-size:13px; font-weight:700;">دفع عند الاستلام</div>
            </div>
            <div style="text-align:center; padding:18px; border:1px solid var(--line-border); border-radius:var(--radius-sm);">
              <div style="font-size:24px; font-weight:800; color:var(--accent-action);">24-48h</div>
              <div style="font-size:13px; font-weight:700;">توصيل سريع</div>
            </div>
          </div>

          <a href="/" class="btn-primary">
            <span>استكشف منتجاتنا</span>
            <span aria-hidden="true">←</span>
          </a>
        </article>
      </div>
    `;
  }

  // 7. Help & FAQs Page View
  function renderHelp() {
    const main = $('#main');
    if (!main) return;

    document.title = `الدعم والمساعدة | ${catalog.settings.name}`;

    const faqs = [
      {
        q: 'كيف يتم الدفع؟',
        a: 'نعتمد نظام الدفع عند الاستلام (Cash on Delivery). لا تدفع أي شيء عبر الإنترنت؛ تدفع نقدًا لمندوب التوصيل بعد استلام الطرد ومعاينته.'
      },
      {
        q: 'كم يستغرق توصيل الطلب؟',
        a: 'يستغرق التوصيل من 24 إلى 48 ساعة للجزائر العاصمة والمدن الكبرى، ومن يومين إلى ثلاثة أيام لباقي ولايات الوطن الـ 58.'
      },
      {
        q: 'هل يمكنني معاينة المنتج قبل الدفع؟',
        a: 'نعم بالتأكيد! يمكنك فتح الطرد أمام مندوب التوصيل والتأكد من مطابقة المنتج لطلبك قبل تسليم المبلغ.'
      },
      {
        q: 'ماذا لو وصلني منتج به عيب مصنعي أو غير مطابق؟',
        a: 'نوفر سياسة استبدال أو استرجاع فورية ومجانية خلال 48 ساعة من تاريخ الاستلام في حال وجود أي خلل مصنعي.'
      },
      {
        q: 'كيف أتابع حالة طلبي؟',
        a: 'بمجرد تسجيل طلبك، سيتصل بك فريقنا لتأكيده، وستصلك رسالة نصية أو اتصال من المندوب في يوم التوصيل.'
      }
    ];

    main.innerHTML = `
      <div class="page-container-narrow">
        <article class="page-card">
          <span class="hero-tag">SUPPORT / الدعم والمساعدة</span>
          <h1 class="page-header-title">الأسئلة الشائعة والمساعدة</h1>
          <p class="page-header-desc">كل ما تحتاج معرفته عن الشحن والدفع وسياسة الاستبدال.</p>

          <div class="faq-list">
            ${faqs.map((faq, i) => `
              <div class="faq-item">
                <button type="button" class="faq-question-btn" data-faq="${i}">
                  <span>${esc(faq.q)}</span>
                  <span class="faq-toggle-icon">+</span>
                </button>
                <div class="faq-answer-body" id="faq-ans-${i}" hidden>
                  ${esc(faq.a)}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:36px; padding:24px; background:var(--bg-canvas); border-radius:var(--radius-md); text-align:center;">
            <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">هل لديك سؤال آخر؟</h3>
            <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">فريق خدمة العملاء جاهز للإجابة على جميع استفساراتك.</p>
            <a href="/" class="btn-primary">العودة للتسوق</a>
          </div>
        </article>
      </div>
    `;

    $$('.faq-question-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.faq;
        const ans = $(`#faq-ans-${id}`);
        const icon = btn.querySelector('.faq-toggle-icon');
        if (ans) {
          const isOpen = !ans.hidden;
          ans.hidden = isOpen;
          if (icon) icon.textContent = isOpen ? '+' : '−';
        }
      };
    });
  }

  // 8. Privacy & Terms Page View
  function renderPrivacy() {
    const main = $('#main');
    if (!main) return;

    document.title = `الشروط والخصوصية | ${catalog.settings.name}`;

    main.innerHTML = `
      <div class="page-container-narrow">
        <article class="page-card">
          <span class="hero-tag">LEGAL / الشروط والخصوصية</span>
          <h1 class="page-header-title">سياسة الخصوصية وشروط الخدمة</h1>
          <p class="page-header-desc">نلتزم بحماية خصوصيتك ومعلوماتك الشخصية بأعلى درجات الأمان والشفافية.</p>

          <div class="tab-panel-body" style="font-size:14px;">
            <h3>1. المعلومات التي نجمعها</h3>
            <p>عند إتمام طلبك، نطلب اسمك ورقم هاتفك وعنوان التوصيل فقط، وذلك لمعالجة الشحن والتواصل معك لتأكيد تسليم الطرد.</p>
            <br>
            <h3>2. سرية وأمان البيانات</h3>
            <p>لا نقوم أبدًا ببيع أو مشاركة بياناتك الشخصية مع أي طرف ثالث لأغراض إعلانية. بياناتك تستخدم حصريًا من قبل فريق المتجر وشركة التوصيل لتسليم طلبك.</p>
            <br>
            <h3>3. الدفع عند الاستلام</h3>
            <p>المتجر لا يطلب ولا يخزن أي معلومات بنكية أو بطاقات دفع. الدفع يتم نقدًا بالدينار الجزائري عند استلام المنتج وفحصه.</p>
            <br>
            <h3>4. وضع المعاينة التجريبي</h3>
            <p>في وضع المعاينة (Demo Mode)، يتم تخزين بيانات السلة والمفضلة محليًا داخل متصفحك (LocalStorage) ولا يتم إرسال طلبات حقيقية.</p>
          </div>

          <div style="margin-top:32px;">
            <a href="/" class="btn-primary">موافق، العودة للمتجر</a>
          </div>
        </article>
      </div>
    `;
  }

  // 9. Account Page View
  function renderAccount() {
    const main = $('#main');
    if (!main) return;

    document.title = `حسابي | ${catalog.settings.name}`;

    main.innerHTML = `
      <div class="page-container-narrow">
        <article class="page-card">
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
            <div style="width:60px; height:60px; border-radius:50%; background:var(--accent-soft); color:var(--accent-action); display:flex; align-items:center; justify-content:center;">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h1 class="page-header-title" style="margin-bottom:2px;">مرحبًا بك في Shop Online</h1>
              <span class="cart-heading-meta">تسوق براحة وأمان مع خدمة الدفع عند الاستلام</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px;">
            <a href="/cart" style="display:block; padding:20px; border:1px solid var(--line-border); border-radius:var(--radius-sm); transition:all .18s;" class="account-card-link">
              <div style="font-weight:700; font-size:16px; margin-bottom:4px;">سلة التسوق</div>
              <div style="font-size:13px; color:var(--text-muted);">${cart.length} عناصر في سلتك</div>
            </a>
            <a href="/favorites" style="display:block; padding:20px; border:1px solid var(--line-border); border-radius:var(--radius-sm); transition:all .18s;" class="account-card-link">
              <div style="font-weight:700; font-size:16px; margin-bottom:4px;">المفضلة</div>
              <div style="font-size:13px; color:var(--text-muted);">${favorites.length} منتجات محفوظة</div>
            </a>
          </div>

          <div style="background:var(--bg-canvas); border-radius:var(--radius-md); padding:20px; margin-bottom:24px;">
            <h3 style="font-size:16px; font-weight:700; margin-bottom:8px;">إدارة المتجر</h3>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">إذا كنت مسؤول المتجر، يمكنك الدخول إلى لوحة التحكم لإدارة المنتجات والطلبات.</p>
            <a href="/admin" class="btn-continue-shopping">الدخول للوحة الإدارة ↗</a>
          </div>

          <a href="/" class="btn-primary">متابعة التسوّق</a>
        </article>
      </div>
    `;
  }

  // 10. Admin Page (Preserve existing functionality)
  async function renderAdmin() {
    const main = $('#main');
    if (!main) return;

    document.title = `إدارة المتجر | ${catalog.settings.name}`;

    try {
      const session = await api('/api/session');
      if (!session.admin && !session.demo) {
        main.innerHTML = `
          <div class="page-container-narrow">
            <form id="admin-login-form" class="page-card">
              <span class="hero-tag">STORE MANAGEMENT</span>
              <h1 class="page-header-title">دخول الإدارة</h1>
              <p class="page-header-desc">إدارة المنتجات والطلبات ومحتوى المتجر.</p>
              <div class="form-group" style="margin-bottom:18px;">
                <label class="form-label" for="admin-pass">كلمة مرور الإدارة</label>
                <input type="password" id="admin-pass" name="password" class="form-input" required autocomplete="current-password">
              </div>
              <button type="submit" class="btn-primary" style="width:100%;">تسجيل الدخول</button>
              <p id="admin-login-error" style="color:#E02424; font-size:13px; margin-top:12px;" role="alert"></p>
            </form>
          </div>
        `;

        $('#admin-login-form').onsubmit = async e => {
          e.preventDefault();
          try {
            await api('/api/login', { password: $('#admin-pass').value });
            await renderAdmin();
          } catch (err) {
            $('#admin-login-error').textContent = err.message;
          }
        };
        return;
      }

      adminData = await api(session.demo ? '/api/demo/admin' : '/api/admin/data');
      catalog.settings = adminData.settings;

      main.innerHTML = `
        <div class="page-container-narrow" style="max-width:1100px;">
          <div class="cart-title-row">
            <div>
              <span class="hero-tag">ADMIN DASHBOARD</span>
              <h1 class="page-header-title">إدارة المتجر</h1>
            </div>
            <button type="button" class="btn-continue-shopping" id="admin-logout-btn">تسجيل الخروج</button>
          </div>

          <div class="filter-chips" style="margin-bottom:20px;">
            <button type="button" class="chip-btn active" data-admin-tab="products">المنتجات (${adminData.products.length})</button>
            <button type="button" class="chip-btn" data-admin-tab="orders">الطلبات (${adminData.orders.length})</button>
            <button type="button" class="chip-btn" data-admin-tab="settings">إعدادات المتجر</button>
          </div>

          <div id="admin-tab-content">
            <div style="background:#FFFFFF; border:1px solid var(--line-border); border-radius:var(--radius-md); padding:20px; overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:right;">
                <thead>
                  <tr style="border-bottom:2px solid var(--line-border);">
                    <th style="padding:10px;">المنتج</th>
                    <th style="padding:10px;">القسم</th>
                    <th style="padding:10px;">السعر</th>
                    <th style="padding:10px;">المخزون</th>
                    <th style="padding:10px;">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminData.products.map(p => `
                    <tr style="border-bottom:1px solid var(--line-light);">
                      <td style="padding:12px 10px; font-weight:700;">${esc(p.name)}</td>
                      <td style="padding:12px 10px; color:var(--text-muted);">${esc(p.category)}</td>
                      <td style="padding:12px 10px; font-weight:700;">${money(p.price)}</td>
                      <td style="padding:12px 10px;">${p.stock}</td>
                      <td style="padding:12px 10px;"><span style="background:#EAF7EE; color:#1B7A3E; padding:3px 8px; border-radius:var(--radius-pill); font-size:12px;">${esc(p.status)}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      $('#admin-logout-btn').onclick = async () => {
        await api('/api/logout', {});
        location.reload();
      };
    } catch (err) {
      main.innerHTML = `<div class="empty-state-view"><h2 class="empty-title">تعذر فتح الإدارة</h2><p class="empty-subtitle">${esc(err.message)}</p></div>`;
    }
  }

  // --- Router & URL Navigation ---
  function router() {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // Read query params if any
    const catParam = searchParams.get('category');
    if (catParam) {
      selectedCategory = catParam;
    }
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      selectedSort = sortParam;
    }

    // Update active state on nav links
    $$('.nav-item').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === path || (path === '/' && href === '/'));
    });

    $$('.mobile-nav-btn').forEach(btn => {
      const navTarget = btn.dataset.nav;
      const isHome = path === '/' && navTarget === 'home';
      const isCart = path === '/cart' && navTarget === 'cart';
      const isFav = path === '/favorites' && navTarget === 'favorites';
      const isAcc = path === '/account' && navTarget === 'account';
      btn.classList.toggle('active', isHome || isCart || isFav || isAcc);
    });

    if (path === '/') {
      renderHome();
    } else if (path.startsWith('/product/')) {
      const slug = decodeURIComponent(path.slice(9));
      renderDetail(slug);
    } else if (path === '/cart') {
      renderCart();
    } else if (path === '/favorites') {
      renderFavorites();
    } else if (path === '/about') {
      renderAbout();
    } else if (path === '/help') {
      renderHelp();
    } else if (path === '/privacy') {
      renderPrivacy();
    } else if (path === '/account') {
      renderAccount();
    } else if (path === '/admin') {
      renderAdmin();
    } else {
      renderHome();
    }

    window.scrollTo(0, 0);
  }

  function navigate(url) {
    history.pushState(null, '', url);
    router();
  }

  // Intercept local link clicks for SPA smooth transitions
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
      return;
    }

    // Hash links on home
    if (href.startsWith('#')) {
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // SPA page navigation
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => {
    router();
  });

  // Global Search input handlers
  function setupSearchInputs() {
    const desktopSearch = $('#site-search-input');
    const mobileSearch = $('#mobile-search-input');
    const searchBtn = $('#site-search-btn');

    function onSearchChange(val) {
      searchQuery = val;
      if (desktopSearch && desktopSearch.value !== val) desktopSearch.value = val;
      if (mobileSearch && mobileSearch.value !== val) mobileSearch.value = val;

      if (location.pathname !== '/') {
        navigate('/');
      } else {
        renderProductsGrid();
        const col = $('#collection');
        if (col && val.trim()) col.scrollIntoView({ behavior: 'smooth' });
      }
    }

    if (desktopSearch) {
      desktopSearch.addEventListener('input', e => onSearchChange(e.target.value));
      desktopSearch.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSearchChange(desktopSearch.value);
        }
      });
    }

    if (mobileSearch) {
      mobileSearch.addEventListener('input', e => onSearchChange(e.target.value));
      mobileSearch.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSearchChange(mobileSearch.value);
        }
      });
    }

    if (searchBtn) {
      searchBtn.onclick = () => {
        if (desktopSearch) onSearchChange(desktopSearch.value);
      };
    }
  }

  // Categories Dropdown Setup
  function setupCategoriesDropdown() {
    const trigger = $('#all-cats-trigger');
    const menu = $('#cats-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.onclick = e => {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', !isOpen);
    };

    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && e.target !== trigger) {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Populate dropdown items
    menu.innerHTML = [
      'الكل',
      'إلكترونيات',
      'أزياء وإكسسوارات',
      'المنزل',
      'أحذية',
      'ساعات وإكسسوارات'
    ].map(cat => `
      <a href="/?category=${encodeURIComponent(cat)}" class="cats-dropdown-item" data-dropdown-cat="${esc(cat)}">
        <span>${esc(cat)}</span>
      </a>
    `).join('');

    menu.querySelectorAll('[data-dropdown-cat]').forEach(item => {
      item.onclick = e => {
        e.preventDefault();
        selectedCategory = item.dataset.dropdownCat;
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        navigate('/');
      };
    });
  }

  // --- Initial Startup ---
  (async function init() {
    updateBadges();
    setupSearchInputs();
    setupCategoriesDropdown();

    try {
      const data = await api('/api/catalog');
      if (data && data.products) {
        // Enrich server demo products with baseline details
        const enriched = BASELINE_PRODUCTS.map(base => {
          const remote = data.products.find(p => p.id === base.id || p.slug === base.slug);
          return remote ? { ...base, ...remote, images: base.images } : base;
        });

        // Also append any custom products added via admin that aren't in baseline
        for (const p of data.products) {
          if (!enriched.some(e => e.id === p.id || e.slug === p.slug)) {
            enriched.push(p);
          }
        }

        catalog.products = enriched;
        if (data.categories && data.categories.length) {
          catalog.categories = Array.from(new Set([...catalog.categories, ...data.categories]));
        }
        if (data.settings) {
          catalog.settings = { ...catalog.settings, ...data.settings };
        }
        catalog.demo = data.demo ?? true;
      }
    } catch (e) {
      console.warn('Backend catalog sync notice:', e.message);
    }

    // Show Demo Banner if in demo mode
    const notice = $('#notice');
    if (notice) {
      notice.hidden = !catalog.demo;
    }

    router();
  })();
})();
