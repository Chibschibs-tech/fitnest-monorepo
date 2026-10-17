// A small, standalone pilot based on the September meals contract.
// Integer rational arithmetic; final rounding only. This is NOT deployed.
const fraction = value => {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,11})(\.\d{1,9})?$/.test(value)) throw new Error('Decimal string required');
  const [whole, decimals = ''] = value.split('.');
  return [BigInt(whole + decimals), 10n ** BigInt(decimals.length)];
};
const gcd = (a, b) => b === 0n ? a : gcd(b, a % b);
const reduce = ([a, b]) => { const d = gcd(a, b); return [a / d, b / d]; };
const mul = ([a, b], [c, d]) => reduce([a * c, b * d]);
const div = ([a, b], [c, d]) => { if (c === 0n) throw new Error('Division by zero'); return reduce([a * d, b * c]); };
const add = ([a, b], [c, d]) => reduce([a * d + c * b, b * d]);
const positive = f => f[0] > 0n;

export function calculateRecipeCost(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return { status: 'incomplete', reasons: ['lines_required'] };
  const reasons = [];
  let total = [0n, 1n];
  const ids = new Set();
  for (const line of lines) {
    try {
      if (!line || typeof line.id !== 'string' || !line.id || ids.has(line.id)) throw new Error('unique_line_id_required');
      ids.add(line.id);
      if (line.priceMinor === null || line.priceMinor === undefined) throw new Error('price_unknown');
      if (line.currency !== 'MAD') throw new Error('currency_not_supported');
      if (!line.priceSource || !line.yieldSource) throw new Error('source_required');
      if (typeof line.priceMinor !== 'string' || !/^(0|[1-9]\d{0,14})$/.test(line.priceMinor)) throw new Error('invalid_price');
      const rawNet = fraction(line.rawNetG), netYield = fraction(line.purchaseNetYield), quantity = fraction(line.quotedQuantity);
      if (!positive(rawNet) || !positive(quantity) || !positive(netYield) || netYield[0] > netYield[1]) throw new Error('invalid_quantity_or_yield');
      let gramsPerPurchaseUnit;
      if (line.quotedUnit === 'kg') gramsPerPurchaseUnit = [1000n, 1n];
      else if (line.quotedUnit === 'L') {
        if (!line.densitySource) throw new Error('density_source_required');
        const density = fraction(line.densityGPerMl);
        if (!positive(density)) throw new Error('invalid_density');
        gramsPerPurchaseUnit = mul([1000n, 1n], density);
      } else throw new Error('unit_not_supported');
      const grossGrams = div(rawNet, netYield);
      const purchaseGrams = mul(quantity, gramsPerPurchaseUnit);
      total = add(total, mul(div(grossGrams, purchaseGrams), [BigInt(line.priceMinor), 1n]));
    } catch (error) { reasons.push({ line: line?.id ?? null, reason: error.message }); }
  }
  if (reasons.length) return { status: 'incomplete', reasons };
  const rounded = (total[0] * 2n + total[1]) / (2n * total[1]);
  return { status: 'complete', currency: 'MAD', exactMinor: { numerator: String(total[0]), denominator: String(total[1]) }, roundedMinor: String(rounded) };
}
