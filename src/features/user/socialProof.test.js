import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSocialProof, readSocialFlow, socialErrorMessage, SOCIAL_FLOW_KEY } from './socialProof.js';

test('browser proof uses fresh 256-bit randomness and a matching S256 challenge', async () => {
  const a = await createSocialProof(), b = await createSocialProof();
  assert.match(a.verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.match(a.challenge, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(a.verifier, b.verifier);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(a.verifier)));
  assert.equal(Buffer.from(digest).toString('base64url'), a.challenge);
});
test('flow metadata expires and cannot be loaded from malformed storage', () => {
  const storage = (value) => ({ getItem: (key) => key === SOCIAL_FLOW_KEY ? value : null });
  const flow = { provider: 'google', verifier: 'a'.repeat(43), createdAt: 1000 };
  assert.equal(readSocialFlow(storage(JSON.stringify(flow)), 2000).provider, 'google');
  assert.equal(readSocialFlow(storage(JSON.stringify(flow)), 602000), null);
  assert.equal(readSocialFlow(storage(JSON.stringify(flow)), 999), null);
  assert.equal(readSocialFlow(storage('{broken'), 2000), null);
  assert.equal(readSocialFlow(storage(JSON.stringify({ ...flow, provider: 'unknown' })), 2000), null);
});
test('email collisions explain linking instead of suggesting a new account', () => {
  assert.match(socialErrorMessage('EMAIL_EXISTS'), /liên kết/);
  assert.match(socialErrorMessage('INVALID_TICKET'), /hết hạn|sử dụng/);
});
