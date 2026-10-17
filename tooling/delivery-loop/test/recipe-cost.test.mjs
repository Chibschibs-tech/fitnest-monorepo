import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRecipeCost } from '../fixtures/recipe-cost.mjs';

const line = (extra = {}) => ({ id: 'poultry', currency: 'MAD', rawNetG: '200', purchaseNetYield: '0.8', quotedQuantity: '1', quotedUnit: 'kg', priceMinor: '8000', priceSource: 'fixture:quote', yieldSource: 'fixture:kitchen', ...extra });

test('COST-UNKNOWN: missing price blocks cost instead of becoming zero', () => {
  for (const value of [null, undefined]) {
    const result = calculateRecipeCost([line({ priceMinor: value })]);
    assert.equal(result.status, 'incomplete');
    assert.equal(result.reasons[0].reason, 'price_unknown');
    assert.equal(result.roundedMinor, undefined);
  }
});
test('COST-ZERO: explicitly known zero price remains valid', () => {
  assert.equal(calculateRecipeCost([line({ priceMinor: '0' })]).roundedMinor, '0');
});
test('COST-UNITS: applies gross/net yield to an explicit kilogram quote', () => {
  assert.equal(calculateRecipeCost([line()]).roundedMinor, '2000');
});
test('COST-UNITS: litres need a documented density', () => {
  const oil = line({ id: 'oil', rawNetG: '9', purchaseNetYield: '1', quotedUnit: 'L', priceMinor: '10000', densityGPerMl: '0.9', densitySource: 'fixture:supplier' });
  assert.equal(calculateRecipeCost([oil]).roundedMinor, '100');
  assert.equal(calculateRecipeCost([{ ...oil, densitySource: null }]).status, 'incomplete');
  assert.equal(calculateRecipeCost([{ ...oil, densityGPerMl: null }]).status, 'incomplete');
});
test('COST-ROUNDING: totals exact fractions before rounding once', () => {
  const rows = [1, 2, 3].map(id => line({ id: String(id), rawNetG: '1', purchaseNetYield: '1', priceMinor: '499' }));
  const result = calculateRecipeCost(rows);
  assert.equal(result.roundedMinor, '1');
  assert.deepEqual(result.exactMinor, { numerator: '1497', denominator: '1000' });
});
test('rejects missing sources, duplicated lines, invalid yields and currencies', () => {
  for (const row of [line({ priceSource: '' }), line({ purchaseNetYield: '0' }), line({ purchaseNetYield: '1.1' }), line({ currency: 'EUR' }), line({ priceMinor: '-1' }), line({ rawNetG: '1e3' }), line({ priceMinor: 8000 })]) {
    assert.equal(calculateRecipeCost([row]).status, 'incomplete');
  }
  assert.equal(calculateRecipeCost([line(), line()]).status, 'incomplete');
  assert.equal(calculateRecipeCost([]).status, 'incomplete');
});
