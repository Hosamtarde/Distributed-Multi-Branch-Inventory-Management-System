// test/race-condition.js
// اختبار السباق: زبونين بيسحبوا من نفس سطر المخزون بنفس اللحظة
const BASE_URL = 'http://localhost:3000';
const INVENTORY_ID = '91d70738-7f1d-47f5-9dd5-50b26cba9e2a';
const START_QTY = 3;   // الكمية اللي بنبلش فيها
const TAKE_QTY = 2;    // كل زبون بدو ياخد 2 (المجموع 4 > 3)

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: '123456' }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(body)}`);
  return body.data.accessToken;   // الرد مغلّف بـ ResponseInterceptor
}

async function getQuantity(token) {
  const res = await fetch(`${BASE_URL}/inventory/${INVENTORY_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return body.data.quantity;
}

async function adjust(token, quantity) {
  const res = await fetch(`${BASE_URL}/inventory/${INVENTORY_ID}/adjust`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quantity }),
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  const token = await login();
  console.log('🔑 تم تسجيل الدخول\n');

  // نرجّع المخزون لـ START_QTY عشان الاختبار يكون قابل للتكرار
  const current = await getQuantity(token);
  if (current !== START_QTY) await adjust(token, START_QTY - current);
  console.log(`📦 المخزون الحالي: ${START_QTY} — كل زبون بدو ${TAKE_QTY}\n`);

  const [a, b] = await Promise.all([adjust(token, -TAKE_QTY), adjust(token, -TAKE_QTY)]);

  console.log(`[زبون A] ${a.status} —`, a.body.message ?? `الكمية صارت ${a.body.data?.quantity}`);
  console.log(`[زبون B] ${b.status} —`, b.body.message ?? `الكمية صارت ${b.body.data?.quantity}`);

  const final = await getQuantity(token);
  const ok = [a.status, b.status].sort().join(',') === '200,400' && final === START_QTY - TAKE_QTY;
  console.log(`\n📦 المخزون النهائي: ${final}`);
  console.log(ok ? '✅ نجح — القفل منع البيع الزائد' : '❌ فشل — راجع النتائج');
}

main().catch((e) => console.error('💥', e.message));