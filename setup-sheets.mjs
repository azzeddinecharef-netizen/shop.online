import { sheets } from './storage.mjs';
import { defaults } from './domain.mjs';
const existing=await sheets('?fields=sheets.properties.title');
const names=new Set(existing.sheets.map(s=>s.properties.title));
const missing=['Products','Orders','Settings'].filter(n=>!names.has(n));
if(missing.length) await sheets(':batchUpdate','POST',{requests:missing.map(title=>({addSheet:{properties:{title}}}))});
for(const tab of missing) await sheets(`/values/${tab}!A1:B1?valueInputOption=RAW`,'PUT',{values:[['id','data_json']]});
if(missing.includes('Settings')) await sheets('/values/Settings!A2:B2?valueInputOption=RAW','PUT',{values:[['store',JSON.stringify({id:'store',...defaults})]]});
console.log('Google Sheets initialized. Existing tabs and data were preserved.');
