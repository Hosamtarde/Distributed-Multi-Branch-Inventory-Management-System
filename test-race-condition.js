const INVENTORY_ITEM_ID = '91d70738-7f1d-47f5-9dd5-50b26cba9e2a';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzkyNDQ5Mi02YTdmLTQxNTUtYmQ1MS05MDZkODBiZGE3OWIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg3NzY5OTc5LCJleHAiOjE3ODc4NTYzNzl9.MFyHYao80uxP814NG2cbvR5wLHcScA-tZw_EyCxX_ng';

async function attemptSale(customerName, quantityToDeduct) {
  const response = await fetch(
    `http://localhost:3000/inventory/${INVENTORY_ITEM_ID}/adjust`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ quantity: -quantityToDeduct }),
    },
  );

  const data = await response.json();
  console.log(`\n[${customerName}] Status: ${response.status}`);
  console.log(`[${customerName}] Response:`, JSON.stringify(data, null, 2));
}

async function runTest() {
  console.log('🚀 بدء الاختبار: زبونين يحاولون شراء بنفس اللحظة...\n');
  console.log('المخزون الحالي: 3 قطع');
  console.log('كل زبون بيحاول يشتري 2 قطعة (المجموع 4 > المتوفر 3)\n');

  await Promise.all([
    attemptSale('زبون A', 2),
    attemptSale('زبون B', 2),
  ]);

  console.log('\n✅ انتهى الاختبار — راجع النتائج فوق');
}

runTest();