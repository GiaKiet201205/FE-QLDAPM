import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { addToCart, readCart, removeFromCart } from './cartStore.js';
import { userReturnTo } from './authNavigation.js';

let values;
beforeEach(() => {
  values = new Map();
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = { dispatchEvent() {} };
});
test('changing class replaces the course in the cart without duplicating its price', () => {
  addToCart('toeic-650', 'GK-TOEIC-1226-A');
  addToCart('toeic-650', 'GK-TOEIC-1226-B');
  assert.deepEqual(readCart(), [{ courseId: 'toeic-650', classId: 'GK-TOEIC-1226-B' }]);
});
test('guest cart rejects malformed identifiers; availability is validated by the API', () => {
  assert.throws(() => addToCart('', 'class-id'));
  assert.throws(() => addToCart('course-id', '../invalid')); 
  assert.equal(readCart().length, 0);
});
test('removing one course retains other courses and a malformed stored cart is ignored', () => {
  addToCart('toeic-650', 'GK-TOEIC-1226-A');
  addToCart('mos-excel', 'GK-MOS-1226');
  removeFromCart('toeic-650');
  assert.deepEqual(readCart(), [{ courseId: 'mos-excel', classId: 'GK-MOS-1226' }]);
  values.set('gk.storefront.cart.v1', '{broken');
  assert.deepEqual(readCart(), []);
});
test('login preserves a selected class and rejects external redirect targets', () => {
  const checkout = '/checkout/toeic-650?class=GK-TOEIC-1226-B';
  assert.equal(userReturnTo(checkout), checkout);
  assert.equal(userReturnTo('/checkout/cart'), '/checkout/cart');
  assert.equal(userReturnTo('/user/profile?payment=gk-order-123'), '/user/profile?payment=gk-order-123');
  assert.equal(userReturnTo('/payment/gk-order-123'), '/user/profile');
  assert.equal(userReturnTo('/payment/../../admin'), '/user/profile');
  for (const target of ['https://example.com', '//example.com', '/checkout/../admin', '/checkout/cart?redirect=https://example.com']) {
    assert.equal(userReturnTo(target), '/user/profile');
  }
});

test('a stored guest cart deduplicates courses and drops malformed identifiers', () => {
  values.set('gk.storefront.cart.v1', JSON.stringify([
    { courseId: 'toeic-650', classId: 'GK-TOEIC-1226-A' },
    { courseId: 'toeic-650', classId: 'GK-TOEIC-1226-B' },
    { courseId: 'mos-excel', classId: null },
    { courseId: 'unknown', classId: '../invalid' },
  ]));
  assert.deepEqual(readCart(), [{ courseId: 'toeic-650', classId: 'GK-TOEIC-1226-B' }]);
});
