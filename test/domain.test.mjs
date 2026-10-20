import test from 'node:test';
import assert from 'node:assert/strict';
import {activeCategories,productInput,makeOrder} from '../domain.mjs';
const input={name:'قميص صيفي',description:'قطن',category:'ملابس',price:2200,stock:4,status:'active',images:[]};
test('only categories with active in-stock products are public',()=>{
  assert.deepEqual(activeCategories([{...input},{...input,category:'آلة',stock:0},{...input,category:'سرّي',status:'draft'}]),['ملابس']);
});
test('product link is unique and remains stable when renamed',()=>{
  const a=productInput(input),b=productInput(input);
  assert.notEqual(a.slug,b.slug);
  assert.equal(productInput({...input,name:'اسم جديد'},a).slug,a.slug);
});
test('server recomputes order total and ignores client price',()=>{
  const p=productInput(input);
  const order=makeOrder({name:'Test Customer',phone:'0555555555',address:'Sample address, Algeria',items:[{id:p.id,quantity:2,price:1}],total:2},[p],{currency:'DZD'});
  assert.equal(order.total,4400);
});
test('duplicate product lines cannot bypass stock validation',()=>{
  const p=productInput(input);
  assert.throws(()=>makeOrder({name:'Test',phone:'0555555555',address:'Sample address',items:[{id:p.id,quantity:3},{id:p.id,quantity:3}]},[p],{currency:'DZD'}));
});
test('drafts and out-of-stock products cannot be ordered',()=>{
  const p=productInput({...input,status:'draft'});
  assert.throws(()=>makeOrder({name:'Test',phone:'0555555555',address:'Sample address',items:[{id:p.id,quantity:1}]},[p],{currency:'DZD'}));
});
test('unsafe image references, negative price and fractional inventory are rejected',()=>{
  for(const bad of [{images:['../../.env']},{price:-1},{stock:1.5}])assert.throws(()=>productInput({...input,...bad}));
});
