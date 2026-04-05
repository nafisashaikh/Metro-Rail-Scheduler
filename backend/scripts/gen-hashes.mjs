import crypto from 'node:crypto';
const K = 64;
function h(pw) {
  const s = crypto.randomBytes(16).toString('hex');
  return { s, h: crypto.scryptSync(pw, s, K).toString('hex') };
}
const a = h('Admin@1234');
const b = h('Super@1234');
const c = h('Empl@1234');
const d = h('pass123');
const e = h('metro2024');
console.log('ADMIN   salt:', a.s, '\n        hash:', a.h);
console.log('SUPER   salt:', b.s, '\n        hash:', b.h);
console.log('EMPL    salt:', c.s, '\n        hash:', c.h);
console.log('PASS123 salt:', d.s, '\n        hash:', d.h);
console.log('METRO24 salt:', e.s, '\n        hash:', e.h);
