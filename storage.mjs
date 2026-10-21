import { createSign } from 'node:crypto';
import { defaults } from './domain.mjs';
let accessToken, expires = 0;
const demo = process.env.DEMO_MODE === 'true';
const memory = {
  Products: [
    {id:'demo-1',slug:'everyday-headphones',name:'سماعة لاسلكية',category:'إلكترونيات',description:'مثال توضيحي لشكل صفحة المنتج. أضف منتجاتك وصورها الحقيقية من لوحة الإدارة بعد ربط المتجر.',price:8900,stock:8,status:'active',images:[],createdAt:new Date().toISOString()},
    {id:'demo-2',slug:'weekend-bag',name:'حقيبة يومية',category:'أكسسوارات',description:'منتج تجريبي لمعاينة تصميم المتجر فقط. لا تُرسل طلبات فعلية في وضع المعاينة.',price:4200,stock:12,status:'active',images:[],createdAt:new Date().toISOString()},
    {id:'demo-3',slug:'desk-lamp',name:'مصباح مكتبي',category:'المنزل',description:'منتج تجريبي لمعاينة تخطيط بطاقات المنتجات.',price:3500,stock:6,status:'active',images:[],createdAt:new Date().toISOString()}
  ],
  Settings:[{id:'store',...defaults}], Orders: []
};
export { demo };
export function ready() {
  return !!(process.env.SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}
async function token() {
  if (accessToken && Date.now() < expires) return accessToken;
  if (!ready()) throw new Error('Google Sheets غير مربوط بعد.');
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({alg:'RS256',typ:'JWT'})}.${encode({iss:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${unsigned}.${signature}`}),signal:AbortSignal.timeout(20000)});
  if (!r.ok) throw new Error('تعذّر الاتصال بحساب خدمة Google.');
  const t = await r.json(); accessToken=t.access_token; expires=Date.now()+Math.max(0,t.expires_in-120)*1000;
  return accessToken;
}
export async function sheets(path='', method='GET', body) {
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.SHEET_ID)}${path}`,{
    method, headers:{Authorization:`Bearer ${await token()}`,'Content-Type':'application/json'},
    body:body ? JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  if (!r.ok) throw new Error('تعذّر قراءة أو حفظ البيانات في Google Sheets.');
  return r.json();
}
export async function rows(tab) {
  if (demo || !ready()) return structuredClone(memory[tab] || []);
  const data=await sheets(`/values/${tab}!A2:B`);
  return (data.values || []).map(([id,json]) => ({...JSON.parse(json),id}));
}
// One Node server instance serializes changes. Sheets is not transactional.
let queue = Promise.resolve();
export function exclusive(operation) {
  const result = queue.then(operation); queue = result.catch(()=>{}); return result;
}
export async function save(tab, object) {
  if (!ready()) {
    const list = memory[tab] = memory[tab] || [];
    const index = list.findIndex(x => x.id === object.id);
    if (index < 0) list.unshift(object);
    else list[index] = object;
    return;
  }
  const data=await sheets(`/values/${tab}!A2:A`);
  const index=(data.values || []).findIndex(([id])=>id===object.id);
  const values=[[object.id,JSON.stringify(object)]];
  if (index<0) return sheets(`/values/${tab}!A:B:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,'POST',{values});
  return sheets(`/values/${tab}!A${index+2}:B${index+2}?valueInputOption=RAW`,'PUT',{values});
}
export async function settings() { return {...defaults,...(await rows('Settings')).find(x=>x.id==='store')}; }
export async function github(path, method='GET', body, raw=false) {
  if (!process.env.GITHUB_TOKEN) throw new Error('رفع الصور غير مفعّل بعد.');
  const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(process.env.GITHUB_OWNER)}/${encodeURIComponent(process.env.GITHUB_REPO)}/contents/${path}`,{
    method,headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(25000)});
  if(!r.ok) throw new Error('تعذر الوصول إلى صورة المنتج في GitHub.');
  return raw?Buffer.from(await r.arrayBuffer()):r.json();
}
