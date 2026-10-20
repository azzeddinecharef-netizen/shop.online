import { randomUUID } from 'node:crypto';

export const categories = ['ملابس', 'آلات ومعدات', 'أكسسوارات', 'إلكترونيات', 'المنزل', 'رياضة', 'جمال وعناية', 'أخرى'];
export const defaults = { name: 'Shop Online', currency: 'DZD', headline: 'كل ما تحتاجه، في مكان واحد.', introduction: 'اختيارات متنوعة للحياة اليومية. اكتشف المنتجات، قارن التفاصيل، واطلب بسهولة.',
  about: 'متجر متعدد الأقسام يجمع المنتجات في تجربة بسيطة وواضحة. تصفّح الأقسام المتاحة واطّلع على تفاصيل كل منتج قبل إرسال طلبك.',
  delivery: 'يتواصل معك فريق المتجر لتأكيد التوفر وتكلفة التوصيل قبل شحن الطلب.' };
export function available(products) {
  return products.filter(p => p.status === 'active' && p.stock > 0);
}
export function activeCategories(products) {
  return [...new Set(available(products).map(p => p.category))];
}
export function productInput(data, existing) {
  const name = String(data.name || '').trim();
  const description = String(data.description || '').trim();
  const category = String(data.category || '').trim();
  const price = Number(data.price), stock = Number(data.stock);
  if (!name || name.length > 120 || !category || category.length > 80 || description.length > 6000)
    throw new Error('أدخل اسمًا وقسمًا ووصفًا صالحًا.');
  if (!Number.isFinite(price) || price <= 0 || price > 1e9 || !Number.isInteger(stock) || stock < 0 || stock > 1e6)
    throw new Error('تحقق من السعر والكمية.');
  if (!['active', 'draft', 'archived'].includes(data.status)) throw new Error('حالة غير صالحة.');
  const images = data.images || [];
  if (!Array.isArray(images) || images.length > 8 || images.some(p => !/^media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(p)))
    throw new Error('صور غير صالحة.');
  const id = existing?.id || randomUUID();
  const slug = existing?.slug || `${name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 70)}-${id.slice(0, 8)}`;
  return { id, slug, name, description, category, price, stock, status: data.status, images,
    createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
}
export function makeOrder(input, products, settings) {
  const name = String(input.name || '').trim(), phone = String(input.phone || '').trim(), address = String(input.address || '').trim();
  if (name.length < 2 || name.length > 100 || !/^[+\d ()-]{7,24}$/.test(phone) || address.length < 8 || address.length > 500)
    throw new Error('تحقق من الاسم ورقم الهاتف والعنوان.');
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 30) throw new Error('السلة غير صالحة.');
  const quantities = new Map();
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('كمية غير صالحة.');
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  }
  const items = [...quantities].map(([id, quantity]) => {
    const p = available(products).find(p => p.id === id);
    if (!p || quantity > p.stock || quantity > 99) throw new Error('أحد المنتجات غير متوفر بالكمية المطلوبة.');
    return { id, name: p.name, quantity, price: p.price };
  });
  return { id: randomUUID(), name, phone, address, items, total: Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100,
    currency: settings.currency, status: 'pending', payment: 'cash_on_delivery', createdAt: new Date().toISOString() };
}
