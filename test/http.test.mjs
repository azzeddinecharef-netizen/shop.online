import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('demo HTTP boundary: catalog, private admin, CSRF, disabled writes and traversal',async()=>{
  const port=32139,base=`http://127.0.0.1:${port}`;
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),BASE_URL:base,DEMO_MODE:'true'},stdio:['ignore','pipe','pipe']});
  try{
    await once(child.stdout,'data');
    const catalog=await (await fetch(base+'/api/catalog')).json();
    assert.equal(catalog.demo,true);assert.equal(catalog.products.length,3);
    assert.equal((await fetch(base+'/api/admin/data')).status,401);
    assert.equal((await fetch(base+'/api/orders',{method:'POST',headers:{Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{}'})).status,403);
    assert.equal((await fetch(base+'/api/orders',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,503);
    assert.equal((await fetch(base+'/.env')).status,404);
    assert.equal((await fetch(base+'/product/missing')).status,404);
    assert.match((await fetch(base)).headers.get('content-security-policy'),/frame-ancestors 'none'/);
  }finally{child.kill();}
});
