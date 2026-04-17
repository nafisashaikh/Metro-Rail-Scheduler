import crypto from 'node:crypto';
const K = 64;
function h(pw) {
  const s = crypto.randomBytes(16).toString('hex');
  return { s, h: crypto.scryptSync(pw, s, K).toString('hex') };
}

const passwords = process.argv.slice(2);

if (passwords.length === 0) {
  console.error('Usage: node backend/scripts/gen-hashes.mjs <password1> [password2] ...');
  process.exit(1);
}

passwords.forEach((pw, index) => {
  const hashed = h(pw);
  const label = `INPUT_${index + 1}`;
  console.log(`${label} salt:`, hashed.s, '\n        hash:', hashed.h);
});
