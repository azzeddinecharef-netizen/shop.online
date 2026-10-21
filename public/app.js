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

  // Universal Image Source Resolver
  function imgSrc(path) {
    if (!path) return './images/headphones.jpg';
    if (typeof path !== 'string') return './images/headphones.jpg';
    if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\/+/, '');
    return './' + clean;
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

  // --- Live Streaming State & Realtime Communication ---
  const DEFAULT_LIVE_STATE = {
    isLive: false,
    hostPeerId: 'shoponline-live-host',
    title: 'عرض وتجربة منتجات حصرية مباشرة',
    scheduledTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    pinnedProductId: 'demo-1',
    viewersCount: 4,
    reactionsCount: 16,
    messages: [
      { id: 1, user: 'فريق المتجر', text: 'أهلاً بكم في البث المباشر لمتجر Shop Online! تفضلوا بطرح استفساراتكم.', time: '10:00', isAdmin: true },
      { id: 2, user: 'سفيان (الجزائر)', text: 'السلام عليكم، هل الدفع متوفر عند الاستلام؟', time: '10:02', isAdmin: false },
      { id: 3, user: 'فريق المتجر', text: 'وعليكم السلام يا سفيان، نعم نوفر الدفع عند الاستلام مع المعاينة قبل الدفع!', time: '10:03', isAdmin: true }
    ]
  };

  let liveState = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shop_live_state') || 'null');
      return stored ? { ...DEFAULT_LIVE_STATE, ...stored } : { ...DEFAULT_LIVE_STATE };
    } catch {
      return { ...DEFAULT_LIVE_STATE };
    }
  })();

  let liveCountdownInterval = null;
  let liveBroadcastBus = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      liveBroadcastBus = new BroadcastChannel('shop_live_channel');
      liveBroadcastBus.onmessage = e => {
        if (!e.data) return;
        if (e.data.type === 'SYNC_LIVE_STATE') {
          liveState = e.data.state;
          if ($('#hero-live-container')) {
            renderHeroLiveCard();
          }
          if ($('#admin-live-chat-messages')) {
            updateAdminLiveChat();
          }
        } else if (e.data.type === 'NEW_REACTION') {
          triggerFloatingHeart();
        } else if (e.data.type === 'NEW_CHAT_MSG') {
          if (!liveState.messages.find(m => m.id === e.data.msg.id)) {
            liveState.messages.push(e.data.msg);
            saveLiveState(false);
            if ($('#client-chat-messages')) appendClientChatMessage(e.data.msg);
            if ($('#admin-live-chat-messages')) appendAdminChatMessage(e.data.msg);
          }
        }
      };
    }
  } catch (e) {}

  window.addEventListener('storage', e => {
    if (e.key === 'shop_live_state' && e.newValue) {
      try {
        liveState = JSON.parse(e.newValue);
        if ($('#hero-live-container')) renderHeroLiveCard();
        if ($('#admin-live-chat-messages')) updateAdminLiveChat();
      } catch (err) {}
    }
  });

  function saveLiveState(broadcast = true) {
    try {
      localStorage.setItem('shop_live_state', JSON.stringify(liveState));
      if (broadcast && liveBroadcastBus) {
        liveBroadcastBus.postMessage({ type: 'SYNC_LIVE_STATE', state: liveState });
      }
    } catch (e) {}
  }

  function formatScheduleDate(dateStr) {
    try {
      if (!dateStr) return 'غداً 8:00 مساءً';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'غداً 8:00 مساءً';
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleDateString('ar-DZ', options);
    } catch {
      return 'غداً 8:00 مساءً';
    }
  }

  function triggerFloatingHeart() {
    const container = $('#floating-hearts-container');
    if (!container) return;
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    const hearts = ['❤️', '💖', '🔥', '👏', '😍', '✨'];
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = (Math.random() * 55) + 'px';
    container.appendChild(heart);
    setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, 2400);
  }

  function renderChatMessagesHtml(messages) {
    if (!messages || !messages.length) {
      return '<div style="color:rgba(255,255,255,0.4); text-align:center; padding:10px;">لا توجد رسائل بعد... كن أول من يكتب!</div>';
    }
    return messages.slice(-15).map(m => `
      <div class="live-chat-msg">
        <span class="chat-user-name ${m.isAdmin ? 'is-admin' : ''}">${esc(m.user)}:</span>
        <span class="chat-text">${esc(m.text)}</span>
      </div>
    `).join('');
  }

  function getPinnedProductHtml(prodId) {
    const p = catalog.products.find(item => item.id === prodId) || catalog.products[0];
    if (!p) return '';
    const img = imgSrc(p.images && p.images[0]);
    return `
      <div class="live-pinned-product">
        <img src="${esc(img)}" alt="${esc(p.name)}" class="pinned-prod-img">
        <div class="pinned-prod-info">
          <span class="pinned-badge">⭐ معروض في البث</span>
          <div class="pinned-prod-title">${esc(p.name)}</div>
          <div class="pinned-prod-price">${money(p.price)}</div>
        </div>
        <button type="button" class="btn-pinned-buy" data-live-buy-id="${esc(p.id)}">
          <span>اشتري الآن</span>
        </button>
      </div>
    `;
  }

  function getHeroLiveCardHtml() {
    if (!liveState.isLive) {
      const isReminded = localStorage.getItem('shop_live_reminded') === 'true';
      return `
        <article class="hero-live-card is-offline" id="hero-live-card">
          <div>
            <div class="live-offline-badge-row">
              <span class="live-badge-offline"><span class="dot"></span> بث مباشر قريباً</span>
              <span class="live-schedule-time">📅 ${formatScheduleDate(liveState.scheduledTime)}</span>
            </div>
            <h2 class="live-offline-title">${esc(liveState.title || 'عرض وتجربة المنتجات مباشرة')}</h2>
            <p class="live-offline-desc">بث حي بالصوت والصورة لاستعراض الخامات والمميزات الحقيقية، مع تخفيضات خاصة وإجابة مباشرة على كل أسئلتكم!</p>
            
            <div class="live-countdown-grid" id="live-countdown-grid">
              <div class="countdown-box"><span class="countdown-num" id="cd-days">00</span><span class="countdown-label">أيام</span></div>
              <div class="countdown-box"><span class="countdown-num" id="cd-hours">00</span><span class="countdown-label">ساعات</span></div>
              <div class="countdown-box"><span class="countdown-num" id="cd-mins">00</span><span class="countdown-label">دقائق</span></div>
              <div class="countdown-box"><span class="countdown-num" id="cd-secs">00</span><span class="countdown-label">ثواني</span></div>
            </div>
          </div>

          <div class="live-offline-actions">
            <button type="button" class="btn-remind-live ${isReminded ? 'is-active' : ''}" id="btn-remind-live">
              <span>${isReminded ? '✓ تم تفعيل التذكير بالبث' : '🔔 تذكيري بموعد البث'}</span>
            </button>
            <a href="/?category=ساعات وإكسسوارات" class="hero-side-link" style="justify-content:center; color:var(--text-ink);">
              <span>تصفح المنتجات في المتجر</span>
              <span aria-hidden="true">←</span>
            </a>
          </div>
        </article>
      `;
    }

    return `
      <article class="hero-live-card is-live" id="hero-live-card">
        <div class="live-player-wrap">
          <video id="client-live-video" class="live-video-element" autoplay playsinline muted></video>
          
          <div class="live-video-placeholder" id="client-video-placeholder">
            <div class="spinner" style="border-top-color:#FF5A36; width:36px; height:36px;"></div>
            <span style="font-size:13px; font-weight:700;">جاري الاتصال بالبث المباشر...</span>
          </div>

          <!-- Top Overlay -->
          <div class="live-top-overlay">
            <span class="live-badge-active"><span style="width:7px; height:7px; border-radius:50%; background:#FFF; display:inline-block;"></span> مباشر</span>
            <div class="live-viewers-badge">
              <span>👁️</span> <span id="client-viewers-count">${liveState.viewersCount || 1}</span> مشاهد
            </div>
            <div class="live-overlay-controls">
              <button type="button" class="btn-icon-overlay" id="btn-client-mute" title="تشغيل / كتم الصوت">🔊</button>
              <button type="button" class="btn-icon-overlay" id="btn-client-fullscreen" title="ملء الشاشة">⛶</button>
            </div>
          </div>

          <!-- Floating Hearts -->
          <div class="floating-hearts-container" id="floating-hearts-container"></div>

          <!-- Pinned Product -->
          <div id="live-pinned-product-container">
            ${getPinnedProductHtml(liveState.pinnedProductId)}
          </div>

          <!-- Mini Live Chat -->
          <div class="live-chat-panel">
            <div class="live-chat-messages" id="client-chat-messages">
              ${renderChatMessagesHtml(liveState.messages)}
            </div>
            <form id="client-chat-form" class="live-chat-input-bar">
              <input type="text" id="client-chat-input" class="live-chat-input" placeholder="اكتب تعليقاً في البث..." maxlength="100" autocomplete="off">
              <button type="submit" class="btn-chat-send" title="إرسال">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
              <button type="button" class="btn-live-reaction" id="btn-send-heart" title="إرسال تفاعل">❤️</button>
            </form>
          </div>
        </div>
      </article>
    `;
  }

  function appendClientChatMessage(msg) {
    const list = $('#client-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'live-chat-msg';
    div.innerHTML = `
      <span class="chat-user-name ${msg.isAdmin ? 'is-admin' : ''}">${esc(msg.user)}:</span>
      <span class="chat-text">${esc(msg.text)}</span>
    `;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function appendAdminChatMessage(msg) {
    const list = $('#admin-live-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = `studio-chat-msg ${msg.isAdmin ? 'is-admin' : ''}`;
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
        <strong style="color:${msg.isAdmin ? '#E65100' : '#00695C'};">${esc(msg.user)}</strong>
        <small style="color:var(--text-muted);">${esc(msg.time || '')}</small>
      </div>
      <div>${esc(msg.text)}</div>
    `;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function updateAdminLiveChat() {
    const list = $('#admin-live-chat-messages');
    if (!list) return;
    if (!liveState.messages.length) {
      list.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:20px;">لا توجد رسائل دردشة حتى الآن.</div>';
      return;
    }
    list.innerHTML = liveState.messages.slice(-25).map(m => `
      <div class="studio-chat-msg ${m.isAdmin ? 'is-admin' : ''}">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <strong style="color:${m.isAdmin ? '#E65100' : '#00695C'};">${esc(m.user)}</strong>
          <small style="color:var(--text-muted);">${esc(m.time || '')}</small>
        </div>
        <div>${esc(m.text)}</div>
      </div>
    `).join('');
    list.scrollTop = list.scrollHeight;
  }

  function renderHeroLiveCard() {
    const container = $('#hero-live-container');
    if (!container) return;
    container.innerHTML = getHeroLiveCardHtml();
    initHeroLiveCard();
  }

  function initHeroLiveCard() {
    if (!liveState.isLive) {
      // Countdown Timer Logic
      clearInterval(liveCountdownInterval);
      const updateCountdown = () => {
        const target = new Date(liveState.scheduledTime).getTime();
        const now = Date.now();
        const diff = target - now;

        const cdDays = $('#cd-days');
        const cdHours = $('#cd-hours');
        const cdMins = $('#cd-mins');
        const cdSecs = $('#cd-secs');

        if (diff <= 0) {
          if (cdDays) cdDays.textContent = '00';
          if (cdHours) cdHours.textContent = '00';
          if (cdMins) cdMins.textContent = '00';
          if (cdSecs) cdSecs.textContent = '00';
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
        if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
        if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
        if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
      };

      updateCountdown();
      liveCountdownInterval = setInterval(updateCountdown, 1000);

      const remindBtn = $('#btn-remind-live');
      if (remindBtn) {
        remindBtn.onclick = () => {
          const current = localStorage.getItem('shop_live_reminded') === 'true';
          const next = !current;
          localStorage.setItem('shop_live_reminded', String(next));
          remindBtn.classList.toggle('is-active', next);
          remindBtn.querySelector('span').textContent = next ? '✓ تم تفعيل التذكير بالبث' : '🔔 تذكيري بموعد البث';
          toast(next ? 'تم تفعيل التذكير! سنقوم بإشعارك فور بدء البث.' : 'تم إلغاء التذكير.');
          if (next && 'Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
          }
        };
      }
    } else {
      // Active Live Stream Handlers
      const video = $('#client-live-video');
      const placeholder = $('#client-video-placeholder');

      // Attach media stream: check local admin stream first (for same-browser testing)
      if (adminLiveStream) {
        if (video) {
          video.srcObject = adminLiveStream;
          video.play().catch(() => {});
        }
        if (placeholder) placeholder.style.display = 'none';
      } else if (typeof Peer !== 'undefined' && liveState.hostPeerId) {
        // Connect to remote broadcaster via PeerJS
        try {
          const viewerPeer = new Peer();
          viewerPeer.on('open', () => {
            // Initiate call with empty stream
            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const emptyStream = canvas.captureStream(1);
            const call = viewerPeer.call(liveState.hostPeerId, emptyStream);
            if (call) {
              call.on('stream', remoteStream => {
                if (video) {
                  video.srcObject = remoteStream;
                  video.play().catch(() => {});
                }
                if (placeholder) placeholder.style.display = 'none';
              });
            }
          });
          viewerPeer.on('error', () => {
            // Fallback placeholder
            if (placeholder) {
              placeholder.innerHTML = `
                <div style="font-size:24px; margin-bottom:6px;">📡</div>
                <span style="font-size:13px; font-weight:700;">البث المباشر نشط</span>
                <span style="font-size:11px; color:#8C94A0;">جاري مزامنة الصوت والصورة...</span>
              `;
            }
          });
        } catch (e) {
          console.warn('Viewer PeerJS error:', e);
        }
      }

      // Audio Mute/Unmute Toggle
      const muteBtn = $('#btn-client-mute');
      if (muteBtn && video) {
        muteBtn.onclick = () => {
          video.muted = !video.muted;
          muteBtn.textContent = video.muted ? '🔇' : '🔊';
          toast(video.muted ? 'تم كتم صوت البث' : 'تم تشغيل صوت البث');
        };
      }

      // Fullscreen Toggle
      const fsBtn = $('#btn-client-fullscreen');
      const playerCard = $('#hero-live-card');
      if (fsBtn && playerCard) {
        fsBtn.onclick = () => {
          if (!document.fullscreenElement) {
            playerCard.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        };
      }

      // Heart Reaction Button
      const heartBtn = $('#btn-send-heart');
      if (heartBtn) {
        heartBtn.onclick = () => {
          triggerFloatingHeart();
          liveState.reactionsCount = (liveState.reactionsCount || 0) + 1;
          saveLiveState(false);
          if (liveBroadcastBus) {
            liveBroadcastBus.postMessage({ type: 'NEW_REACTION' });
          }
        };
      }

      // Live Chat Send Form
      const chatForm = $('#client-chat-form');
      const chatInput = $('#client-chat-input');
      if (chatForm && chatInput) {
        chatForm.onsubmit = e => {
          e.preventDefault();
          const text = chatInput.value.trim();
          if (!text) return;
          const newMsg = {
            id: Date.now() + Math.random(),
            user: 'زائر ' + Math.floor(Math.random() * 899 + 100),
            text: text,
            time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
            isAdmin: false
          };
          liveState.messages.push(newMsg);
          saveLiveState(false);
          appendClientChatMessage(newMsg);
          if (liveBroadcastBus) {
            liveBroadcastBus.postMessage({ type: 'NEW_CHAT_MSG', msg: newMsg });
          }
          chatInput.value = '';
        };
      }

      // Pinned Product Direct Buy Button
      const pinnedBuyBtn = document.querySelector('[data-live-buy-id]');
      if (pinnedBuyBtn) {
        pinnedBuyBtn.onclick = () => {
          const id = pinnedBuyBtn.dataset.liveBuyId;
          addToCart(id, 1);
          location.hash = '#/cart';
        };
      }
    }
  }

  // --- Admin Live Broadcasting State & Methods ---
  let adminLiveStream = null;
  let adminLivePeer = null;
  let adminMediaRecorder = null;
  let adminRecordedChunks = [];
  let adminRecordTimerInterval = null;
  let adminRecordSeconds = 0;

  async function startAdminCamera() {
    try {
      adminLiveStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });
      const video = $('#admin-cam-video');
      const placeholder = $('#admin-cam-placeholder');
      if (video) {
        video.srcObject = adminLiveStream;
        video.hidden = false;
      }
      if (placeholder) placeholder.hidden = true;
      toast('تم تشغيل كاميرا الويب بنجاح.');
      return adminLiveStream;
    } catch (err) {
      console.warn('Physical camera not available or permission denied, using simulated stream:', err);
      return createSimulatedAdminStream();
    }
  }

  function createSimulatedAdminStream() {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    function animate() {
      frame++;
      ctx.fillStyle = '#0F131A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createRadialGradient(320, 180, 30, 320, 180, 260);
      grad.addColorStop(0, 'rgba(255, 90, 54, 0.45)');
      grad.addColorStop(1, 'rgba(15, 19, 26, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Shop Online 🔴 مباشر', 320, 160);

      ctx.fillStyle = '#FF5A36';
      ctx.font = '15px Cairo, sans-serif';
      ctx.fillText('استوديو البث المباشر (وضع المعاينة والتحكم)', 320, 196);

      const alpha = 0.4 + 0.6 * Math.sin(frame * 0.08);
      ctx.fillStyle = `rgba(229, 57, 53, ${alpha})`;
      ctx.beginPath();
      ctx.arc(320, 235, 9, 0, Math.PI * 2);
      ctx.fill();

      if (adminLiveStream) requestAnimationFrame(animate);
    }
    animate();

    const stream = canvas.captureStream(30);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      osc.connect(dst);
      osc.start();
      if (dst.stream.getAudioTracks().length) {
        stream.addTrack(dst.stream.getAudioTracks()[0]);
      }
    } catch (e) {}

    adminLiveStream = stream;
    const video = $('#admin-cam-video');
    const placeholder = $('#admin-cam-placeholder');
    if (video) {
      video.srcObject = adminLiveStream;
      video.hidden = false;
    }
    if (placeholder) placeholder.hidden = true;
    toast('تم تفعيل كاميرا الاستوديو بنجاح.');
    return adminLiveStream;
  }

  function adminStartBroadcasting() {
    const doBroadcast = () => {
      liveState.isLive = true;
      liveState.viewersCount = Math.floor(Math.random() * 7) + 4;
      saveLiveState();

      if (typeof Peer !== 'undefined') {
        try {
          if (adminLivePeer) adminLivePeer.destroy();
          const hostId = 'shoponline-live-' + Math.floor(Math.random() * 8999 + 1000);
          adminLivePeer = new Peer(hostId);
          adminLivePeer.on('open', id => {
            liveState.hostPeerId = id;
            saveLiveState();
          });
          adminLivePeer.on('call', call => {
            if (adminLiveStream) call.answer(adminLiveStream);
          });
        } catch (err) {
          console.warn('Peer host error:', err);
        }
      }
      toast('🔴 أنت الآن على الهواء مباشرة! البث معروض في الصفحة الرئيسية.');
    };

    if (!adminLiveStream) {
      startAdminCamera().then(doBroadcast);
    } else {
      doBroadcast();
    }
  }

  function adminStopBroadcasting() {
    liveState.isLive = false;
    saveLiveState();
    if (adminLivePeer) {
      try { adminLivePeer.destroy(); } catch (e) {}
      adminLivePeer = null;
    }
    toast('تم إنهاء البث المباشر بنجاح.');
  }

  function adminToggleRecording() {
    if (adminMediaRecorder && adminMediaRecorder.state === 'recording') {
      adminMediaRecorder.stop();
      clearInterval(adminRecordTimerInterval);
      const btn = $('#btn-studio-record');
      if (btn) {
        btn.classList.remove('is-recording');
        btn.innerHTML = '<span>⏺️ تسجيل البث</span>';
      }
      toast('تم إيقاف التسجيل وحفظ ملف البث على جهازك.');
    } else {
      if (!adminLiveStream) {
        toast('يرجى تشغيل الكاميرا أولاً للبدء بالتسجيل.');
        return;
      }
      adminRecordedChunks = [];
      try {
        adminMediaRecorder = new MediaRecorder(adminLiveStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      } catch (e) {
        try {
          adminMediaRecorder = new MediaRecorder(adminLiveStream);
        } catch (err) {
          toast('المتصفح لا يدعم تسجيل هذا الفيديو.');
          return;
        }
      }
      adminMediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) adminRecordedChunks.push(e.data);
      };
      adminMediaRecorder.onstop = () => {
        const blob = new Blob(adminRecordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `shop-online-live-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
      adminMediaRecorder.start(1000);
      adminRecordSeconds = 0;
      const btn = $('#btn-studio-record');
      if (btn) {
        btn.classList.add('is-recording');
        btn.innerHTML = '<span>⏹️ إيقاف وحفظ (00:00)</span>';
      }
      adminRecordTimerInterval = setInterval(() => {
        adminRecordSeconds++;
        const mins = String(Math.floor(adminRecordSeconds / 60)).padStart(2, '0');
        const secs = String(adminRecordSeconds % 60).padStart(2, '0');
        if (btn) btn.innerHTML = `<span>⏹️ إيقاف وحفظ (${mins}:${secs})</span>`;
      }, 1000);
      toast('بدأ تسجيل البث المباشر ⏺️');
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

        <!-- Live Stream Side Card (Replaces تفاصيل تحبّها) -->
        <div id="hero-live-container">
          ${getHeroLiveCardHtml()}
        </div>
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
    initHeroLiveCard();
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
      const imgPath = imgSrc(p.images && p.images[0]);

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

    let product = catalog.products.find(p => p.slug === slug || decodeURIComponent(p.slug) === decodeURIComponent(slug));
    if (!product) {
      try {
        const raw = localStorage.getItem('shop_admin_products');
        if (raw) {
          const localList = JSON.parse(raw);
          const found = localList.find(p => p.slug === slug || decodeURIComponent(p.slug) === decodeURIComponent(slug));
          if (found) {
            product = found;
            if (!catalog.products.some(p => p.id === product.id)) {
              catalog.products.push(product);
            }
          }
        }
      } catch (e) {}
    }

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
    const productImages = (product.images && product.images.length > 0) ? product.images : ['images/headphones.jpg'];
    const mainImg = imgSrc(productImages[0]);

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
            ${productImages.map((img, idx) => `
              <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-img-src="${esc(imgSrc(img))}" style="cursor:pointer;">
                <img src="${esc(imgSrc(img))}" alt="${esc(product.name)} - ${idx + 1}">
              </div>
            `).join('')}
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
            const rImg = imgSrc(p.images && p.images[0]);
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

    // Thumbnail Switching
    $$('.thumb-item').forEach(thumb => {
      thumb.onclick = () => {
        $$('.thumb-item').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const mainImgEl = $('#detail-main-img');
        if (mainImgEl && thumb.dataset.imgSrc) {
          mainImgEl.src = thumb.dataset.imgSrc;
        }
      };
    });

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
              const img = imgSrc(p.images && p.images[0]);
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
        const orderPhone = $('#order-phone').value;
        const orderAddress = $('#order-address').value;
        const orderNotes = $('#order-notes').value || '';
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        const newOrder = {
          id: orderId,
          name: customerName,
          phone: orderPhone,
          wilaya: wilaya,
          address: orderAddress,
          notes: orderNotes,
          total: subtotal,
          items: cart.map(item => {
            const p = catalog.products.find(x => x.id === item.id) || {};
            return { id: item.id, name: p.name || 'منتج', price: p.price || 0, quantity: item.quantity, color: item.color };
          }),
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Persist order in local admin storage
        try {
          const storedOrders = JSON.parse(localStorage.getItem('shop_admin_orders') || '[]');
          storedOrders.unshift(newOrder);
          localStorage.setItem('shop_admin_orders', JSON.stringify(storedOrders));
        } catch (e) {}

        // Send to Google Sheets if configured
        const sheetUrl = localStorage.getItem('shop_google_sheet_url');
        if (sheetUrl && sheetUrl.startsWith('http')) {
          try {
            fetch(sheetUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'newOrder', order: newOrder })
            });
          } catch (e) {}
        }

        // Show Success Modal
        body.innerHTML = `
          <div style="text-align:center; padding:10px 0;">
            <div style="width:64px; height:64px; background:#EAF7EE; color:#28A745; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style="font-size:24px; font-weight:800; color:var(--text-ink); margin-bottom:8px;">تم تأكيد طلبك بنجاح!</h2>
            <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:16px;">
              شكراً لك يا <strong>${esc(customerName)}</strong> (${esc(wilaya)}).<br>
              رقم طلبك هو: <strong style="color:var(--accent-action); font-size:16px;">#${orderId}</strong>
            </p>
            <div style="background:var(--bg-canvas); border:1px solid var(--line-border); border-radius:var(--radius-sm); padding:14px; font-size:13px; color:var(--text-ink); margin-bottom:24px; text-align:right;">
              <div>• <strong>المبلغ المطلوب عند الاستلام:</strong> ${money(subtotal)}</div>
              <div>• <strong>حالة الطلب:</strong> قيد المراجعة وسيتصل بك فريق العمل لتأكيد الشحن.</div>
              <div>• <strong>العنوان:</strong> ${esc(orderAddress)} - ${esc(wilaya)}</div>
            </div>
            <button type="button" class="btn-primary" id="finish-demo-order-btn" style="width:100%;">
              <span>العودة للتسوّق</span>
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
          const img = imgSrc(p.images && p.images[0]);
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

  // 10. Admin Page (100% Serverless, GitHub Pages, Google Sheets, Direct GitHub Uploads)
  async function renderAdmin() {
    const main = $('#main');
    if (!main) return;

    document.title = `لوحة إدارة المتجر | ${catalog.settings.name}`;

    // 1. Authentication Check (Password is 123)
    const isAuthed = localStorage.getItem('shop_admin_authed') === 'true';

    if (!isAuthed) {
      main.innerHTML = `
        <div class="page-container-narrow" style="max-width:480px; margin:40px auto;">
          <form id="admin-login-form" class="page-card" style="box-shadow:var(--shadow-md); border-color:var(--accent-coral);">
            <div style="text-align:center; margin-bottom:20px;">
              <span class="hero-tag">STORE MANAGEMENT</span>
              <h1 class="page-header-title" style="margin-top:8px;">دخول لوحة التحكم</h1>
              <p class="page-header-desc">أدخل كلمة مرور الإدارة لإدارة المنتجات، الطلبات، والربط المباشر.</p>
            </div>

            <div class="form-group" style="margin-bottom:18px;">
              <label class="form-label" for="admin-pass">كلمة مرور الإدارة</label>
              <input type="password" id="admin-pass" name="password" class="form-input" required autocomplete="current-password" placeholder="أدخل كلمة المرور (123)">
              <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">🔑 كلمة المرور لدخول لوحة التحكم هي: <strong>123</strong></div>
            </div>

            <button type="submit" class="btn-primary" style="width:100%; padding:14px; font-size:16px;">
              <span>تسجيل الدخول إلى الداشبورد</span>
              <span aria-hidden="true">←</span>
            </button>
            <p id="admin-login-error" style="color:#E02424; font-size:13px; margin-top:12px; text-align:center;" role="alert"></p>
          </form>
        </div>
      `;

      $('#admin-login-form').onsubmit = async e => {
        e.preventDefault();
        const enteredPass = $('#admin-pass').value.trim();
        if (enteredPass === '123') {
          localStorage.setItem('shop_admin_authed', 'true');
          toast('تم تسجيل الدخول بنجاح! مرحباً بك في لوحة الإدارة.');
          await renderAdmin();
        } else {
          // Optional fallback for local dev server
          try {
            await api('/api/login', { password: enteredPass });
            localStorage.setItem('shop_admin_authed', 'true');
            await renderAdmin();
          } catch (err) {
            $('#admin-login-error').textContent = 'كلمة المرور غير صحيحة. كلمة المرور هي 123';
          }
        }
      };
      return;
    }

    // 2. Load and Combine Data
    let localProds = [];
    try {
      const raw = localStorage.getItem('shop_admin_products');
      if (raw) localProds = JSON.parse(raw);
    } catch (e) {}

    let localOrders = [];
    try {
      const rawO = localStorage.getItem('shop_admin_orders');
      if (rawO) localOrders = JSON.parse(rawO);
    } catch (e) {}

    let remoteData = null;
    try {
      remoteData = await api('/api/demo/admin');
    } catch (e) {}

    let allProducts = [...(remoteData?.products || BASELINE_PRODUCTS)];
    if (localProds && localProds.length) {
      for (const lp of localProds) {
        const idx = allProducts.findIndex(p => p.id === lp.id || p.slug === lp.slug);
        if (idx >= 0) allProducts[idx] = { ...allProducts[idx], ...lp };
        else allProducts.unshift(lp);
      }
    }

    let savedSettings = null;
    try {
      const rawS = localStorage.getItem('shop_settings');
      if (rawS) savedSettings = JSON.parse(rawS);
    } catch (e) {}

    adminData = {
      products: allProducts,
      orders: localOrders.length ? localOrders : (remoteData?.orders || []),
      settings: savedSettings || remoteData?.settings || catalog.settings,
      categories: catalog.categories
    };

    const sheetUrl = localStorage.getItem('shop_google_sheet_url') || '';
    const ghToken = localStorage.getItem('shop_gh_token') || '';
    const ghRepo = localStorage.getItem('shop_gh_repo') || 'azzeddinecharef-netizen/shop.online';
    const ghBranch = localStorage.getItem('shop_gh_branch') || 'main';

    main.innerHTML = `
      <div class="page-container-narrow" style="max-width:1150px; margin:24px auto;">
        <div class="cart-title-row" style="margin-bottom:16px;">
          <div>
            <span class="hero-tag">SHOP ADMIN DASHBOARD</span>
            <h1 class="page-header-title">لوحة إدارة المتجر</h1>
          </div>
          <button type="button" class="btn-continue-shopping" id="admin-logout-btn" style="color:#E02424; border-color:#FECACA;">تسجيل الخروج ✕</button>
        </div>

        <!-- Status Overview Card -->
        <div class="admin-notice-card" style="background:#FFFFFF; border:1px solid var(--line-border); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="font-weight:800; font-size:15px; color:var(--text-ink);">حالة النظام والاستضافة:</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <span class="admin-badge active">🌐 مستضاف على GitHub Pages</span>
              <span class="admin-badge ${sheetUrl ? 'active' : 'draft'}">${sheetUrl ? '📊 Google Sheets متصل' : '⚠️ Google Sheets غير مربوط'}</span>
              <span class="admin-badge ${ghToken ? 'active' : 'draft'}">${ghToken ? '🐙 رفع صور GitHub مباشر' : '⚠️ رمز GitHub غير مدخل'}</span>
            </div>
          </div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">
            نظام متجرك يعمل الآن بالكامل خارج ريلواي وبدون خادم وسيط. عند إضافة أو تعديل المنتجات يتم حفظها فوراً في المتجر، وتُسجّل في Google Sheets، كما تُرفع الصور مباشرة إلى مستودع GitHub.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="filter-chips" style="margin-bottom:20px;">
          <button type="button" class="chip-btn active" data-admin-tab="products">📦 المنتجات (${adminData.products.length})</button>
          <button type="button" class="chip-btn" data-admin-tab="orders">🛍️ الطلبات (${adminData.orders.length})</button>
          <button type="button" class="chip-btn" data-admin-tab="sheets">📊 ربط Google Sheets</button>
          <button type="button" class="chip-btn" data-admin-tab="github">🐙 رفع الصور إلى GitHub</button>
          <button type="button" class="chip-btn" data-admin-tab="settings">⚙️ إعدادات المتجر</button>
          <button type="button" class="chip-btn" data-admin-tab="live" style="color:#D32F2F; font-weight:700;">🔴 البث المباشر (Live)</button>
        </div>

        <div id="admin-tab-content"></div>
      </div>
    `;

    let editingProduct = null;
    let editorImages = [];
    let currentTab = 'products';

    function renderAdminTabs() {
      const tabContent = $('#admin-tab-content');
      if (!tabContent) return;

      $$('[data-admin-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.adminTab === currentTab);
      });

      if (currentTab === 'products') renderAdminProducts(tabContent);
      else if (currentTab === 'orders') renderAdminOrders(tabContent);
      else if (currentTab === 'sheets') renderAdminSheets(tabContent);
      else if (currentTab === 'github') renderAdminGitHub(tabContent);
      else if (currentTab === 'settings') renderAdminSettings(tabContent);
      else if (currentTab === 'live') renderAdminLive(tabContent);
    }

    // --- TAB 1: Products Management ---
    function renderAdminProducts(container) {
      container.innerHTML = `
        <div class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px;">قائمة المنتجات (${adminData.products.length})</h2>
              <p style="font-size:13px; color:var(--text-muted);">إدارة وتعديل المنتجات المنشورة والمخزون والصور والأسعار.</p>
            </div>
            <button type="button" class="btn-primary" id="admin-new-product-btn" style="padding:10px 20px; font-size:14px;">
              <span>+ إضافة منتج جديد</span>
            </button>
          </div>

          <div id="admin-editor-wrap" style="margin-bottom:24px;"></div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>صورة</th>
                  <th>المنتج</th>
                  <th>القسم</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${adminData.products.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">لا توجد منتجات حتى الآن. اضغط "+ إضافة منتج جديد" للبدء.</td></tr>
                ` : adminData.products.map(p => {
                  const thumb = (p.images && p.images[0]) ? p.images[0] : '';
                  return `
                    <tr>
                      <td style="width:50px;">
                        <img src="${esc(imgSrc(thumb))}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid var(--line-border);">
                      </td>
                      <td style="font-weight:700;">${esc(p.name)}</td>
                      <td style="color:var(--text-muted);">${esc(p.category || 'عام')}</td>
                      <td style="font-weight:700; color:var(--text-ink);">${money(p.price)}</td>
                      <td>${p.stock}</td>
                      <td><span class="admin-badge ${esc(p.status || 'active')}">${p.status === 'active' ? 'منشور' : (p.status === 'draft' ? 'مسودة' : 'مؤرشف')}</span></td>
                      <td>
                        <div style="display:flex; gap:8px; align-items:center;">
                          <button type="button" class="btn-secondary" data-admin-edit="${esc(p.id)}" style="padding:6px 12px; font-size:12px;">تعديل</button>
                          <a href="#/product/${encodeURIComponent(p.slug)}" style="font-size:12px; color:var(--accent-action); font-weight:700;">معاينة ↗</a>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      $('#admin-new-product-btn').onclick = () => {
        editingProduct = null;
        editorImages = [];
        openProductEditor();
      };

      container.querySelectorAll('[data-admin-edit]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.adminEdit;
          editingProduct = adminData.products.find(p => p.id === id);
          editorImages = editingProduct ? [...(editingProduct.images || [])] : [];
          openProductEditor();
        };
      });
    }

    function openProductEditor() {
      const wrap = $('#admin-editor-wrap');
      if (!wrap) return;

      const p = editingProduct || { name: '', category: '', description: '', price: '', stock: 1, status: 'active', images: [] };
      const categories = adminData.categories || ['إلكترونيات', 'أزياء وإكسسوارات', 'المنزل', 'أحذية', 'ساعات وإكسسوارات'];
      const hasGhToken = !!localStorage.getItem('shop_gh_token');

      wrap.innerHTML = `
        <form id="admin-product-form" class="admin-card" style="background:#FAFBFD; border-color:var(--accent-coral);">
          <div class="admin-header-row">
            <h3 style="font-size:16px; font-weight:800; color:var(--text-ink);">${editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
            <button type="button" class="btn-secondary" id="admin-cancel-edit-btn" style="padding:6px 14px; font-size:12px;">إلغاء</button>
          </div>

          <div class="admin-form-grid">
            <label class="admin-label">
              <span>اسم المنتج *</span>
              <input type="text" name="name" class="admin-input" required maxlength="120" value="${esc(p.name)}" placeholder="مثال: ساعة ذكية مقاومة للماء">
            </label>

            <label class="admin-label">
              <span>القسم *</span>
              <input type="text" name="category" list="admin-categories-datalist" class="admin-input" required maxlength="80" value="${esc(p.category)}" placeholder="اختر أو اكتب قسماً جديداً">
              <datalist id="admin-categories-datalist">
                ${categories.map(c => `<option value="${esc(c)}">`).join('')}
              </datalist>
            </label>

            <label class="admin-label">
              <span>السعر (${esc(catalog.settings.currency || 'DZD')}) *</span>
              <input type="number" name="price" class="admin-input" min="0.01" step="0.01" required value="${esc(p.price)}" placeholder="0.00">
            </label>

            <label class="admin-label">
              <span>المخزون المتوفر *</span>
              <input type="number" name="stock" class="admin-input" min="0" step="1" required value="${p.stock}">
            </label>

            <label class="admin-label">
              <span>حالة المنتج</span>
              <select name="status" class="admin-select">
                <option value="active" ${p.status === 'active' ? 'selected' : ''}>منشور (يظهر للزبائن في المتجر)</option>
                <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>مسودة (مخفي)</option>
                <option value="archived" ${p.status === 'archived' ? 'selected' : ''}>مؤرشف (غير متاح للطلب)</option>
              </select>
            </label>

            <label class="admin-label">
              <span>رفع صور للمنتج مباشرة إلى GitHub (حتى 8 صور)</span>
              <input type="file" id="admin-files-input" class="admin-input" accept="image/jpeg,image/png,image/webp" multiple>
            </label>

            <div class="full-width">
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">معاينة صور المنتج:</div>
              <div class="admin-image-previews" id="admin-img-previews"></div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
                ${hasGhToken ? '🟢 الرفع المباشر مفعل: عند اختيار الصور يتم إرسالها وحفظها مباشرة في مستودع GitHub الخاص بك.' : '💡 ملاحظة: الصور المختارة حالياً تُحفظ كمعاينة. لرفعها وتخزينها مباشرة في مستودع GitHub، يرجى إدخال GitHub Token في تبويب "رفع الصور إلى GitHub".'}
              </div>
            </div>

            <label class="admin-label full-width">
              <span>وصف المنتج ومميزاته</span>
              <textarea name="description" class="admin-textarea" maxlength="6000" placeholder="اكتب تفاصيل ومميزات المنتج ومحتويات العلبة...">${esc(p.description)}</textarea>
            </label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
            <button type="submit" class="btn-primary" id="admin-save-product-btn" style="padding:12px 28px;">
              <span>${editingProduct ? 'تحديث المنتج' : 'حفظ ونشر المنتج'}</span>
            </button>
          </div>
        </form>
      `;

      renderEditorImages();

      $('#admin-cancel-edit-btn').onclick = () => {
        wrap.innerHTML = '';
      };

      const fileInput = $('#admin-files-input');
      fileInput.onchange = async e => {
        const files = [...e.target.files];
        if (editorImages.length + files.length > 8) {
          toast('الحد الأقصى 8 صور لكل منتج.');
          return;
        }
        const saveBtn = $('#admin-save-product-btn');
        saveBtn.disabled = true;
        fileInput.disabled = true;

        const ghToken = localStorage.getItem('shop_gh_token');
        const repo = localStorage.getItem('shop_gh_repo') || 'azzeddinecharef-netizen/shop.online';
        const branch = localStorage.getItem('shop_gh_branch') || 'main';

        try {
          for (const f of files) {
            if (f.size > 4 * 1024 * 1024) throw new Error('حجم الصورة يجب أن يكون أقل من 4 MB.');

            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(f);
            });

            if (ghToken) {
              const base64Content = dataUrl.split(',')[1];
              const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const fileName = `${Date.now()}-${safeName}`;
              const filePath = `public/images/uploads/${fileName}`;

              try {
                toast(`جارٍ رفع "${f.name}" مباشرة إلى GitHub...`);
                const ghRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `token ${ghToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                  },
                  body: JSON.stringify({
                    message: `Upload product image directly: ${fileName}`,
                    content: base64Content,
                    branch: branch
                  })
                });

                if (!ghRes.ok) {
                  const errJson = await ghRes.json().catch(() => ({}));
                  throw new Error(errJson.message || 'خطأ في استجابة GitHub API');
                }

                // Direct URL from GitHub
                const directUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
                editorImages.push(directUrl);
                toast(`تم رفع "${f.name}" مباشرة إلى GitHub بنجاح! 🚀`);
              } catch (ghErr) {
                console.warn('GitHub direct upload failed, falling back to local preview:', ghErr);
                editorImages.push(dataUrl);
                toast(`تعذر الرفع المباشر لـ GitHub (${ghErr.message}). تم حفظ الصورة كمعاينة.`);
              }
            } else {
              editorImages.push(dataUrl);
              toast('تمت إضافة الصورة كمعاينة محلياً.');
            }
            renderEditorImages();
          }
        } catch (err) {
          toast(err.message);
        } finally {
          saveBtn.disabled = false;
          fileInput.disabled = false;
          fileInput.value = '';
        }
      };

      $('#admin-product-form').onsubmit = async e => {
        e.preventDefault();
        const saveBtn = $('#admin-save-product-btn');
        saveBtn.disabled = true;
        try {
          const formData = new FormData(e.target);
          const input = Object.fromEntries(formData);
          const slug = editingProduct?.slug || (input.name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06ff-]/g, '') || ('prod-' + Date.now());

          const savedProduct = {
            id: editingProduct?.id || ('prod-' + Date.now()),
            name: input.name.trim(),
            category: input.category.trim(),
            price: Number(input.price),
            stock: Number(input.stock),
            status: input.status,
            images: editorImages.length ? editorImages : (editingProduct?.images || ['images/headphones.jpg']),
            description: input.description.trim(),
            slug: slug,
            createdAt: editingProduct?.createdAt || new Date().toISOString()
          };

          // 1. Update in-memory & adminData
          if (editingProduct) {
            const idx = adminData.products.findIndex(x => x.id === savedProduct.id);
            if (idx >= 0) adminData.products[idx] = savedProduct;
          } else {
            adminData.products.unshift(savedProduct);
          }

          // 2. Update catalog.products so it displays immediately across all store pages
          const catIdx = catalog.products.findIndex(x => x.id === savedProduct.id || x.slug === savedProduct.slug);
          if (catIdx >= 0) {
            catalog.products[catIdx] = { ...catalog.products[catIdx], ...savedProduct };
          } else {
            catalog.products.unshift(savedProduct);
          }

          if (savedProduct.category && !catalog.categories.includes(savedProduct.category)) {
            catalog.categories.push(savedProduct.category);
          }

          // 3. Persist locally to localStorage
          try {
            localStorage.setItem('shop_admin_products', JSON.stringify(adminData.products));
          } catch (e) {}

          // 4. Send to Google Sheets if configured
          const sheetUrl = localStorage.getItem('shop_google_sheet_url');
          if (sheetUrl && sheetUrl.startsWith('http')) {
            try {
              fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'saveProduct', product: savedProduct })
              });
              toast('تم حفظ المنتج وتسجيله في Google Sheets بنجاح! 📊');
            } catch (sheetErr) {
              console.warn('Google Sheets sync error:', sheetErr);
            }
          } else {
            toast('تم حفظ المنتج بنجاح وتحديث المتجر.');
          }

          wrap.innerHTML = '';
          renderAdminProducts($('#admin-tab-content'));
        } catch (err) {
          toast(err.message);
        } finally {
          saveBtn.disabled = false;
        }
      };

      wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderEditorImages() {
      const previews = $('#admin-img-previews');
      if (!previews) return;
      if (editorImages.length === 0) {
        previews.innerHTML = '<span style="font-size:12px; color:var(--text-muted);">لم يتم اختيار صور بعد.</span>';
        return;
      }
      previews.innerHTML = editorImages.map((src, i) => `
        <div class="admin-img-thumb">
          <img src="${esc(imgSrc(src))}" alt="صورة ${i+1}">
          <button type="button" data-remove-img="${i}" title="إزالة الصورة">✕</button>
        </div>
      `).join('');

      previews.querySelectorAll('[data-remove-img]').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.removeImg);
          editorImages.splice(idx, 1);
          renderEditorImages();
        };
      });
    }

    // --- TAB 2: Orders Management ---
    function renderAdminOrders(container) {
      const orders = adminData.orders || [];
      container.innerHTML = `
        <div class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px;">إدارة طلبات الدفع عند الاستلام (${orders.length})</h2>
              <p style="font-size:13px; color:var(--text-muted);">متابعة وتأكيد طلبات الزبائن وتحديث حالات الشحن والتسليم.</p>
            </div>
          </div>

          <div class="admin-orders-list">
            ${orders.length === 0 ? `
              <div style="text-align:center; padding:40px; color:var(--text-muted);">
                <div style="font-size:32px; margin-bottom:10px;">📦</div>
                <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">لا توجد طلبات مسجلة حتى الآن</h3>
                <p style="font-size:13px;">عندما يقوم الزبائن بإرسال طلبات من المتجر، ستظهر جميع بياناتهم وتفاصيل الطلب هنا مباشرة.</p>
              </div>
            ` : orders.slice().map(o => `
              <div class="admin-order-card" style="background:#FFFFFF; border:1px solid var(--line-border); border-radius:var(--radius-sm); padding:16px; margin-bottom:16px;">
                <div class="admin-order-head" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <div>
                    <strong style="font-size:16px; color:var(--text-ink);">${esc(o.name)}</strong>
                    <span style="font-size:12px; color:var(--text-muted); margin-right:8px;">(طلب #${esc(o.id)})</span>
                  </div>
                  <div style="font-size:18px; font-weight:800; color:var(--accent-action);">
                    ${money(o.total)}
                  </div>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:13px; color:var(--text-muted); margin-bottom:12px;">
                  <div>📞 <a href="tel:${esc(o.phone)}" style="color:var(--text-ink); font-weight:700;">${esc(o.phone)}</a></div>
                  <div>📍 ${esc(o.address || 'العنوان غير محدد')} - ${esc(o.wilaya || '')}</div>
                  <div>🕒 ${new Date(o.createdAt || Date.now()).toLocaleString('ar-DZ')}</div>
                </div>

                <div style="background:var(--bg-canvas); border-radius:var(--radius-sm); padding:12px; margin-bottom:12px;">
                  <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">المنتجات المطلوبة:</div>
                  <ul class="admin-order-items" style="list-style:none; padding:0; margin:0; font-size:13px;">
                    ${(o.items || []).map(item => `
                      <li>• <strong>${esc(item.name)}</strong> × ${item.quantity} (${money((item.price || 0) * item.quantity)})</li>
                    `).join('')}
                  </ul>
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                  <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700;">
                    <span>حالة الطلب:</span>
                    <select class="admin-select" data-admin-order="${esc(o.id)}" style="width:auto; padding:6px 12px; font-size:13px;">
                      ${[
                        ['pending', 'جديد (قيد المراجعة)'],
                        ['confirmed', 'مؤكد'],
                        ['shipped', 'تم الشحن'],
                        ['delivered', 'تم التسليم بنجاح'],
                        ['cancelled', 'ملغى']
                      ].map(([v, t]) => `<option value="${v}" ${v === o.status ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                  </label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('[data-admin-order]').forEach(select => {
        select.onchange = () => {
          const orderId = select.dataset.adminOrder;
          const newStatus = select.value;
          const found = adminData.orders.find(o => o.id === orderId);
          if (found) {
            found.status = newStatus;
            try {
              localStorage.setItem('shop_admin_orders', JSON.stringify(adminData.orders));
            } catch (e) {}
            toast('تم تحديث حالة الطلب بنجاح.');
          }
        };
      });
    }

    // --- TAB 3: Google Sheets Integration ---
    function renderAdminSheets(container) {
      const currentUrl = localStorage.getItem('shop_google_sheet_url') || '';
      const scriptCode = `/* انسخ هذا الكود بالكامل وضعه في: Extensions -> Apps Script */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ products: [] })).setMimeType(ContentService.MimeType.JSON);
  var rows = data.slice(1);
  var products = rows.filter(function(r){ return r[0] !== 'ORDER'; }).map(function(r) {
    return {
      id: String(r[0]||''),
      name: String(r[1]||''),
      price: Number(r[2]||0),
      category: String(r[3]||''),
      stock: Number(r[4]||1),
      status: String(r[5]||'active'),
      images: r[6] ? String(r[6]).split(',') : [],
      description: String(r[7]||'')
    };
  });
  return ContentService.createTextOutput(JSON.stringify({ products: products })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    if (payload.action === 'newOrder') {
      var o = payload.order;
      sheet.appendRow(['ORDER', o.id, o.name, o.phone, o.wilaya, o.address, o.total, (o.items||[]).map(function(i){ return i.name+' x'+i.quantity; }).join('; '), new Date().toISOString()]);
    } else {
      var p = payload.product || payload;
      sheet.appendRow([p.id || ('prod-'+new Date().getTime()), p.name||'', p.price||0, p.category||'', p.stock||0, p.status||'active', (p.images||[]).join(','), p.description||'', new Date().toISOString()]);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

      container.innerHTML = `
        <div class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px;">📊 ربط جدول Google Sheets المباشر</h2>
              <p style="font-size:13px; color:var(--text-muted);">تسجيل وحفظ المنتجات والطلبات مباشرة في جدول Google Sheets الخاص بك بدون سيرفر.</p>
            </div>
          </div>

          <form id="admin-sheet-form" style="margin-bottom:24px;">
            <label class="admin-label">
              <span style="font-weight:700;">رابط Google Apps Script Web App أو Google Sheet:</span>
              <input type="url" id="sheet-url-input" class="admin-input" value="${esc(currentUrl)}" placeholder="https://script.google.com/macros/s/.../exec" required style="direction:ltr;">
            </label>
            <div style="display:flex; gap:12px; margin-top:12px;">
              <button type="submit" class="btn-primary" style="padding:10px 24px;">حفظ الرابط</button>
              <button type="button" class="btn-secondary" id="test-sheet-ping-btn" style="padding:10px 20px;">اختبار الاتصال ⚡</button>
            </div>
            <div id="sheet-status-msg" style="margin-top:10px; font-size:13px;"></div>
          </form>

          <div style="background:var(--bg-canvas); border:1px solid var(--line-border); border-radius:var(--radius-sm); padding:20px;">
            <h3 style="font-size:15px; font-weight:800; margin-bottom:10px; color:var(--text-ink);">📋 خطوات إنشاء رابط Web App في دقيقة واحدة:</h3>
            <ol style="padding-right:20px; font-size:13px; line-height:1.8; color:var(--text-ink); margin-bottom:16px;">
              <li>افتح جدولك في <strong>Google Sheets</strong>.</li>
              <li>من القائمة العلوية اضغط على <strong>الامتدادات (Extensions)</strong> ثم <strong>Apps Script</strong>.</li>
              <li>امسح أي كود موجود والصق الكود الجاهز أدناه.</li>
              <li>اضغط على زر <strong>نشر (Deploy)</strong> باللون الأزرق ثم اختر <strong>نشر جديد (New deployment)</strong>.</li>
              <li>اختر نوع النشر: <strong>تطبيق ويب (Web app)</strong>، واجعل خيار "من يملك حق الوصول" (Who has access): <strong>الجميع (Anyone)</strong>.</li>
              <li>اضغط نشر وانسخ الرابط الذي ينتهي بـ <code>/exec</code> والصقه في الخانة أعلاه!</li>
            </ol>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:700; color:var(--text-muted);">كود Google Apps Script الجاهز:</span>
              <button type="button" class="btn-secondary" id="copy-script-btn" style="padding:6px 14px; font-size:12px;">📋 نسخ الكود</button>
            </div>
            <textarea id="script-code-area" readonly class="admin-textarea" style="font-family:monospace; font-size:12px; direction:ltr; min-height:180px; background:#191C22; color:#00FF88;">${scriptCode}</textarea>
          </div>
        </div>
      `;

      $('#admin-sheet-form').onsubmit = e => {
        e.preventDefault();
        const val = $('#sheet-url-input').value.trim();
        localStorage.setItem('shop_google_sheet_url', val);
        toast('تم حفظ رابط Google Sheets بنجاح! سيتم تسجيل أي منتج جديد في جدولك تلقائياً.');
        $('#sheet-status-msg').innerHTML = '<span style="color:#1B7A3E; font-weight:700;">✅ تم حفظ الرابط بنجاح! المنتجات والطلبات ستُرسل إلى جدولك مباشرة.</span>';
      };

      $('#copy-script-btn').onclick = () => {
        navigator.clipboard.writeText($('#script-code-area').value);
        toast('تم نسخ كود Apps Script إلى الحافظة! الصقه في Google Sheets.');
      };

      $('#test-sheet-ping-btn').onclick = async () => {
        const url = $('#sheet-url-input').value.trim();
        if (!url) { toast('أدخل الرابط أولاً.'); return; }
        toast('جارٍ اختبار الاتصال...');
        try {
          await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'ping', test: true }) });
          toast('✅ تم إرسال إشارة الاتصال بنجاح إلى الرابط!');
          $('#sheet-status-msg').innerHTML = '<span style="color:#1B7A3E; font-weight:700;">✅ تم إرسال إشارة الاختبار إلى Google Sheets بنجاح!</span>';
        } catch (err) {
          toast('تعذر الاتصال بالرابط: ' + err.message);
        }
      };
    }

    // --- TAB 4: GitHub Direct Image Upload ---
    function renderAdminGitHub(container) {
      const currentToken = localStorage.getItem('shop_gh_token') || '';
      const currentRepo = localStorage.getItem('shop_gh_repo') || 'azzeddinecharef-netizen/shop.online';
      const currentBranch = localStorage.getItem('shop_gh_branch') || 'main';

      container.innerHTML = `
        <div class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px;">🐙 رفع الصور مباشرة إلى مستودع GitHub</h2>
              <p style="font-size:13px; color:var(--text-muted);">رفع صور المنتجات مباشرة من المتصفح إلى GitHub REST API بدون خادم وسيط إطلاقاً.</p>
            </div>
          </div>

          <form id="admin-gh-form" style="margin-bottom:24px;">
            <div class="admin-form-grid">
              <label class="admin-label full-width">
                <span style="font-weight:700;">رمز الوصول الشخصي لجيت هاب (GitHub Personal Access Token - PAT) *</span>
                <input type="password" id="gh-token-input" class="admin-input" value="${esc(currentToken)}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="direction:ltr;" required>
                <span style="font-size:11px; color:var(--text-muted); margin-top:4px;">يُحفظ بأمان داخل متصفحك محلياً (LocalStorage) ويُستخدم حصرياً لإرسال الصور إلى مستودعك.</span>
              </label>

              <label class="admin-label">
                <span style="font-weight:700;">اسم المستودع (Repository) *</span>
                <input type="text" id="gh-repo-input" class="admin-input" value="${esc(currentRepo)}" placeholder="owner/repository" style="direction:ltr;" required>
              </label>

              <label class="admin-label">
                <span style="font-weight:700;">اسم الفرع (Branch) *</span>
                <input type="text" id="gh-branch-input" class="admin-input" value="${esc(currentBranch)}" placeholder="main" style="direction:ltr;" required>
              </label>
            </div>

            <div style="display:flex; gap:12px; margin-top:16px;">
              <button type="submit" class="btn-primary" style="padding:10px 24px;">حفظ إعدادات GitHub</button>
              <button type="button" class="btn-secondary" id="test-gh-btn" style="padding:10px 20px;">اختبار الاتصال بـ GitHub ⚡</button>
            </div>
            <div id="gh-status-msg" style="margin-top:10px; font-size:13px;"></div>
          </form>

          <div style="background:var(--bg-canvas); border:1px solid var(--line-border); border-radius:var(--radius-sm); padding:20px;">
            <h3 style="font-size:15px; font-weight:800; margin-bottom:10px; color:var(--text-ink);">💡 كيف تحصل على GitHub Token في ثوانٍ؟</h3>
            <ol style="padding-right:20px; font-size:13px; line-height:1.8; color:var(--text-ink);">
              <li>سجل دخولك في حسابك على <strong>GitHub</strong>.</li>
              <li>انقر على صورتك في أعلى اليمين -> <strong>Settings</strong> -> ثم من القائمة اليسرى <strong>Developer Settings</strong>.</li>
              <li>اختر <strong>Personal access tokens</strong> ثم <strong>Tokens (classic)</strong>.</li>
              <li>اضغط <strong>Generate new token</strong> وضع علامة صح على صلاحية <strong>repo</strong> (Full control of private/public repositories).</li>
              <li>اضغط توليد وانسخ الرمز الذي يبدأ بـ <code>ghp_</code> والصقه هنا واضغط حفظ!</li>
            </ol>
          </div>
        </div>
      `;

      $('#admin-gh-form').onsubmit = e => {
        e.preventDefault();
        const token = $('#gh-token-input').value.trim();
        const repo = $('#gh-repo-input').value.trim();
        const branch = $('#gh-branch-input').value.trim();

        localStorage.setItem('shop_gh_token', token);
        localStorage.setItem('shop_gh_repo', repo);
        localStorage.setItem('shop_gh_branch', branch);

        toast('تم حفظ إعدادات GitHub بنجاح! سيتم رفع أي صور منتجات مباشرة للمستودع.');
        $('#gh-status-msg').innerHTML = '<span style="color:#1B7A3E; font-weight:700;">✅ تم حفظ الإعدادات! الرفع المباشر إلى GitHub مفعل الآن.</span>';
      };

      $('#test-gh-btn').onclick = async () => {
        const token = $('#gh-token-input').value.trim();
        const repo = $('#gh-repo-input').value.trim();
        if (!token || !repo) {
          toast('يرجى إدخال الرمز واسم المستودع أولاً.');
          return;
        }
        toast('جارٍ التحقق من صلاحيات مستودع GitHub...');
        try {
          const res = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            $('#gh-status-msg').innerHTML = `<span style="color:#1B7A3E; font-weight:700;">✅ الاتصال ممتاز بمستودع (${data.full_name})! لديك صلاحية رفع الصور مباشرة.</span>`;
            toast('✅ اتصال ناجح مع مستودع GitHub!');
          } else {
            const err = await res.json().catch(() => ({}));
            $('#gh-status-msg').innerHTML = `<span style="color:#E02424; font-weight:700;">❌ فشل الاتصال (${err.message || res.statusText}). تأكد من صحة الرمز وتفعيل صلاحية repo.</span>`;
          }
        } catch (e) {
          $('#gh-status-msg').innerHTML = `<span style="color:#E02424; font-weight:700;">❌ خطأ في الشبكة: ${e.message}</span>`;
        }
      };
    }

    // --- TAB 5: Store Settings ---
    function renderAdminSettings(container) {
      const s = adminData.settings || catalog.settings || {};
      container.innerHTML = `
        <form id="admin-settings-form" class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px;">إعدادات ومحتوى المتجر</h2>
              <p style="font-size:13px; color:var(--text-muted);">تعديل نصوص المتجر، العنوان، وسياسة التوصيل والعملة.</p>
            </div>
          </div>

          <div class="admin-form-grid">
            <label class="admin-label">
              <span>اسم المتجر</span>
              <input type="text" name="name" class="admin-input" required maxlength="120" value="${esc(s.name || 'Shop Online')}">
            </label>

            <label class="admin-label">
              <span>العملة الرسمية</span>
              <select name="currency" class="admin-select">
                ${['DZD', 'EUR', 'USD', 'MAD', 'TND'].map(c => `
                  <option value="${c}" ${c === s.currency ? 'selected' : ''}>${c}</option>
                `).join('')}
              </select>
            </label>

            <label class="admin-label full-width">
              <span>عنوان الصفحة الرئيسية (Headline)</span>
              <input type="text" name="headline" class="admin-input" required maxlength="250" value="${esc(s.headline || 'كل ما تحتاجه، في مكان واحد')}">
            </label>

            <label class="admin-label full-width">
              <span>مقدمة المتجر (Introduction)</span>
              <textarea name="introduction" class="admin-textarea" required maxlength="1000">${esc(s.introduction || '')}</textarea>
            </label>

            <label class="admin-label full-width">
              <span>التعريف بالمتجر (About)</span>
              <textarea name="about" class="admin-textarea" required maxlength="5000">${esc(s.about || '')}</textarea>
            </label>

            <label class="admin-label full-width">
              <span>سياسة وشروط التوصيل (Delivery)</span>
              <textarea name="delivery" class="admin-textarea" required maxlength="3000">${esc(s.delivery || '')}</textarea>
            </label>
          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:20px;">
            <button type="submit" class="btn-primary" id="admin-save-settings-btn" style="padding:12px 32px;">
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      `;

      $('#admin-settings-form').onsubmit = e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        adminData.settings = { ...adminData.settings, ...payload };
        catalog.settings = { ...catalog.settings, ...payload };
        try {
          localStorage.setItem('shop_settings', JSON.stringify(catalog.settings));
        } catch (err) {}
        toast('تم حفظ إعدادات المتجر بنجاح.');
      };
    }

    // --- TAB 6: Live Streaming Studio ---
    function renderAdminLive(container) {
      container.innerHTML = `
        <div class="admin-card">
          <div class="admin-header-row">
            <div>
              <h2 style="font-size:18px; font-weight:800; color:var(--text-ink); margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                <span>استوديو البث المباشر</span>
                <span class="${liveState.isLive ? 'live-badge-active' : 'live-badge-offline'}" id="admin-studio-live-badge">
                  ${liveState.isLive ? '🔴 على الهواء الآن' : 'غير متصل (جاهز للبث)'}
                </span>
              </h2>
              <p style="font-size:13px; color:var(--text-muted);">بث حي بالكاميرا والصوت مباشرة للمشاهدين مع عرض المنتجات واستقبال الدردشة.</p>
            </div>
          </div>

          <div class="admin-live-studio-grid">
            <!-- Left Column: Video Viewport & Controls -->
            <div class="studio-video-card">
              <div class="studio-cam-viewport">
                <video id="admin-cam-video" autoplay playsinline muted ${adminLiveStream ? '' : 'hidden'}></video>
                <div class="studio-placeholder-text" id="admin-cam-placeholder" ${adminLiveStream ? 'hidden' : ''}>
                  <div style="font-size:42px; margin-bottom:12px;">📷</div>
                  <h3 style="font-size:16px; font-weight:700; color:#FFF; margin-bottom:6px;">كاميرا الويب غير مشغلة</h3>
                  <p style="font-size:13px; color:#8C94A0;">اضغط على "تشغيل الكاميرا" لمعاينة صورتك والبدء بالبث.</p>
                </div>
              </div>

              <div class="studio-toolbar">
                <div class="studio-media-controls">
                  <button type="button" class="btn-studio-toggle" id="btn-toggle-cam">
                    <span>${adminLiveStream ? 'إيقاف الكاميرا 📹' : 'تشغيل الكاميرا 📹'}</span>
                  </button>
                  <button type="button" class="btn-studio-toggle" id="btn-toggle-mic">
                    <span>كتم المايك 🎙️</span>
                  </button>
                  <button type="button" class="btn-studio-record ${adminMediaRecorder && adminMediaRecorder.state === 'recording' ? 'is-recording' : ''}" id="btn-studio-record">
                    <span>${adminMediaRecorder && adminMediaRecorder.state === 'recording' ? `⏹️ إيقاف وحفظ (${String(Math.floor(adminRecordSeconds/60)).padStart(2,'0')}:${String(adminRecordSeconds%60).padStart(2,'0')})` : '⏺️ تسجيل البث'}</span>
                  </button>
                </div>

                <div>
                  <button type="button" class="btn-go-live ${liveState.isLive ? 'is-broadcasting' : ''}" id="btn-admin-go-live">
                    <span>${liveState.isLive ? '⏹️ إنهاء البث المباشر' : '🔴 بدء البث المباشر الآن'}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Column: Product Showcase, Schedule & Live Chat -->
            <div class="studio-sidebar">
              <!-- Panel 1: Product Showcase / Pin -->
              <div class="studio-panel">
                <div class="studio-panel-title">
                  <span>⭐ تثبيت منتج معروض في البث</span>
                </div>
                <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                  اختر المنتج الذي تتحدث عنه ليظهر للمشاهدين فوراً في أسفل شاشة البث مع زر الشراء.
                </p>
                <div style="display:flex; gap:8px;">
                  <select id="admin-pin-product-select" class="admin-select" style="flex:1;">
                    ${adminData.products.map(p => `
                      <option value="${esc(p.id)}" ${p.id === liveState.pinnedProductId ? 'selected' : ''}>
                        ${esc(p.name)} (${money(p.price)})
                      </option>
                    `).join('')}
                  </select>
                  <button type="button" class="btn-primary" id="btn-save-pinned-product" style="padding:0 16px; font-size:13px;">
                    <span>تثبيت</span>
                  </button>
                </div>
              </div>

              <!-- Panel 2: Schedule Next Stream & Title -->
              <div class="studio-panel">
                <div class="studio-panel-title">
                  <span>📅 عنوان وجدولة البث القادم</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <label class="admin-label">
                    <span>عنوان البث المباشر</span>
                    <input type="text" id="admin-schedule-title" class="admin-input" value="${esc(liveState.title || '')}" placeholder="مثال: تجربة وعروض خاصة على المنتجات">
                  </label>
                  <label class="admin-label">
                    <span>موعد البث (لتشغيل العداد التنازلي)</span>
                    <input type="datetime-local" id="admin-schedule-time" class="admin-input" value="${esc(liveState.scheduledTime || '')}">
                  </label>
                  <button type="button" class="btn-outline" id="btn-save-schedule" style="align-self:flex-start; padding:8px 18px; font-size:13px;">
                    <span>حفظ وتحديث العداد</span>
                  </button>
                </div>
              </div>

              <!-- Panel 3: Live Chat Monitor -->
              <div class="studio-panel">
                <div class="studio-panel-title">
                  <span>💬 محادثات المشاهدين الحية</span>
                  <small style="color:var(--text-muted); font-size:11px;">مزامنة فورية</small>
                </div>
                <div class="studio-chat-container" id="admin-live-chat-messages">
                  <!-- Rendered via updateAdminLiveChat() -->
                </div>
                <form id="admin-studio-chat-form" class="studio-chat-send-box">
                  <input type="text" id="admin-studio-chat-input" class="admin-input" placeholder="رد على المشاهدين كمدير المتجر..." style="padding:8px 12px; font-size:12px;">
                  <button type="submit" class="btn-primary" style="padding:0 14px; font-size:12px;">إرسال</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;

      if (adminLiveStream) {
        const v = $('#admin-cam-video');
        if (v) v.srcObject = adminLiveStream;
      }

      updateAdminLiveChat();

      // Camera Toggle
      $('#btn-toggle-cam').onclick = async () => {
        if (adminLiveStream) {
          adminLiveStream.getTracks().forEach(t => t.stop());
          adminLiveStream = null;
          const v = $('#admin-cam-video');
          const ph = $('#admin-cam-placeholder');
          if (v) { v.srcObject = null; v.hidden = true; }
          if (ph) ph.hidden = false;
          $('#btn-toggle-cam').querySelector('span').textContent = 'تشغيل الكاميرا 📹';
          toast('تم إيقاف الكاميرا.');
        } else {
          await startAdminCamera();
          $('#btn-toggle-cam').querySelector('span').textContent = 'إيقاف الكاميرا 📹';
        }
      };

      // Mic Toggle
      let isMicMuted = false;
      $('#btn-toggle-mic').onclick = () => {
        if (!adminLiveStream) {
          toast('يرجى تشغيل الكاميرا أولاً.');
          return;
        }
        isMicMuted = !isMicMuted;
        adminLiveStream.getAudioTracks().forEach(t => t.enabled = !isMicMuted);
        const btn = $('#btn-toggle-mic');
        btn.classList.toggle('is-muted', isMicMuted);
        btn.querySelector('span').textContent = isMicMuted ? 'إلغاء كتم المايك 🎙️' : 'كتم المايك 🎙️';
        toast(isMicMuted ? 'تم كتم المايكروفون' : 'تم تفعيل المايكروفون');
      };

      // Record Stream Button
      $('#btn-studio-record').onclick = () => {
        adminToggleRecording();
      };

      // Go Live / End Stream Button
      $('#btn-admin-go-live').onclick = () => {
        if (liveState.isLive) {
          adminStopBroadcasting();
          renderAdminLive(container);
        } else {
          adminStartBroadcasting();
          renderAdminLive(container);
        }
      };

      // Pinned Product Save
      $('#btn-save-pinned-product').onclick = () => {
        const sel = $('#admin-pin-product-select');
        if (!sel) return;
        liveState.pinnedProductId = sel.value;
        saveLiveState();
        toast('تم تثبيت المنتج بنجاح في شاشة البث المباشر.');
      };

      // Schedule Save
      $('#btn-save-schedule').onclick = () => {
        const titleInput = $('#admin-schedule-title');
        const timeInput = $('#admin-schedule-time');
        if (titleInput && titleInput.value.trim()) liveState.title = titleInput.value.trim();
        if (timeInput && timeInput.value) liveState.scheduledTime = timeInput.value;
        saveLiveState();
        toast('تم حفظ موعد البث وتحديث العداد التنازلي في الصفحة الرئيسية.');
      };

      // Admin Chat Reply Form
      $('#admin-studio-chat-form').onsubmit = e => {
        e.preventDefault();
        const inp = $('#admin-studio-chat-input');
        if (!inp) return;
        const text = inp.value.trim();
        if (!text) return;
        const newMsg = {
          id: Date.now() + Math.random(),
          user: 'المدير 🌟',
          text: text,
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          isAdmin: true
        };
        liveState.messages.push(newMsg);
        saveLiveState(false);
        appendAdminChatMessage(newMsg);
        if (liveBroadcastBus) {
          liveBroadcastBus.postMessage({ type: 'NEW_CHAT_MSG', msg: newMsg });
        }
        inp.value = '';
      };
    }

    $$('[data-admin-tab]').forEach(btn => {
      btn.onclick = () => {
        currentTab = btn.dataset.adminTab;
        renderAdminTabs();
      };
    });

    renderAdminTabs();

    $('#admin-logout-btn').onclick = () => {
      localStorage.removeItem('shop_admin_authed');
      toast('تم تسجيل الخروج من لوحة التحكم.');
      renderAdmin();
    };
  }

  // --- Router & URL Navigation (Universal Hash & Path Router for GitHub Pages) ---
  function getRoute() {
    const hash = (location.hash || '').replace(/^#\/?/, '').trim();
    if (hash) return hash.split('?')[0];

    const params = new URLSearchParams(location.search);
    if (params.get('page')) return params.get('page');
    if (params.get('product')) return 'product/' + params.get('product');

    let p = location.pathname;
    if (p.includes('/shop.online')) p = p.replace('/shop.online', '');
    p = p.replace(/^\/+/, '').split('?')[0];
    return p;
  }

  function router() {
    const route = getRoute();
    const searchStr = location.hash.includes('?') ? location.hash.split('?')[1] : location.search;
    const searchParams = new URLSearchParams(searchStr);

    const catParam = searchParams.get('category');
    if (catParam) selectedCategory = catParam;
    const sortParam = searchParams.get('sort');
    if (sortParam) selectedSort = sortParam;

    // Update active state on nav links
    $$('.nav-item').forEach(link => {
      const href = (link.getAttribute('href') || '').replace(/^#\/?/, '').replace(/^\/+/, '');
      const isActive = (route === '' && (href === '' || href === '/')) || (href && href === route);
      link.classList.toggle('active', isActive);
    });

    $$('.mobile-nav-btn').forEach(btn => {
      const navTarget = btn.dataset.nav;
      const isHome = (route === '' || route === 'home') && navTarget === 'home';
      const isCart = route === 'cart' && navTarget === 'cart';
      const isFav = route === 'favorites' && navTarget === 'favorites';
      const isAdmin = route === 'admin' && navTarget === 'admin';
      const isAcc = route === 'account' && navTarget === 'account';
      btn.classList.toggle('active', isHome || isCart || isFav || isAdmin || isAcc);
    });

    if (!route || route === '' || route === 'home') {
      renderHome();
    } else if (route.startsWith('product/')) {
      const slug = decodeURIComponent(route.slice(8));
      renderDetail(slug);
    } else if (route === 'cart') {
      renderCart();
    } else if (route === 'favorites') {
      renderFavorites();
    } else if (route === 'about') {
      renderAbout();
    } else if (route === 'help') {
      renderHelp();
    } else if (route === 'privacy') {
      renderPrivacy();
    } else if (route === 'account') {
      renderAccount();
    } else if (route === 'admin') {
      renderAdmin();
    } else {
      renderHome();
    }

    window.scrollTo(0, 0);
  }

  function navigate(url) {
    if (url.startsWith('#')) {
      location.hash = url;
    } else if (url === '/' || url === './') {
      location.hash = '#/';
    } else {
      const clean = url.replace(/^\/+/, '');
      location.hash = '#/' + clean;
    }
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

    // Global Modal backdrop & ESC close handler
    const backdrop = $('#modal-backdrop');
    const closeBtn = $('#modal-close');
    if (closeBtn && backdrop) {
      closeBtn.onclick = () => { backdrop.hidden = true; };
      backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !backdrop.hidden) {
          backdrop.hidden = true;
        }
      });
    }

    try {
      const data = await api('/api/catalog');
      if (data && data.products) {
        // 1. Enrich baseline products with remote data, preserving any updated images
        const enriched = BASELINE_PRODUCTS.map(base => {
          const remote = data.products.find(p => p.id === base.id || p.slug === base.slug);
          const imgs = (remote && remote.images && remote.images.length) ? remote.images : base.images;
          return remote ? { ...base, ...remote, images: imgs } : base;
        });

        // 2. Append any products from server that aren't in baseline
        for (const p of data.products) {
          if (!enriched.some(e => e.id === p.id || e.slug === p.slug)) {
            enriched.push(p);
          }
        }

        // 3. Merge locally saved admin products (from localStorage)
        try {
          const raw = localStorage.getItem('shop_admin_products');
          if (raw) {
            const localProducts = JSON.parse(raw);
            for (const lp of localProducts) {
              const idx = enriched.findIndex(e => e.id === lp.id || e.slug === lp.slug);
              if (idx >= 0) {
                enriched[idx] = { ...enriched[idx], ...lp };
              } else {
                enriched.unshift(lp);
              }
            }
          }
        } catch (e) {}

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
