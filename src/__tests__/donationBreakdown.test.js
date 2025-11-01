const assert = require('assert');
const { calculateBreakdown } = require('../lib/calcDonationBreakdown');

function almostEqual(a, b) {
  return Math.abs(a - b) < 0.001;
}

// Happy path test
(() => {
  const amount = 100.0; // ₹100
  const platformFeePercent = 12; // 12%
  const foundationSharePercent = 65; // 65% of remaining

  const breakdown = calculateBreakdown(amount, platformFeePercent, foundationSharePercent);

  // Expected calculations (rounded to paise):
  // platformFee = round(100 * 0.12 * 100)/100 = 12.00
  // afterPlatformFee = round((100 - 12) * 100)/100 = 88.00
  // foundationAmount = round(88 * 0.65 * 100)/100 = 57.2
  // companyAmount = round((88 - 57.2) * 100)/100 = 30.8

  assert.strictEqual(breakdown.platformFee, 12.0, 'platformFee should be 12.00');
  assert.strictEqual(breakdown.afterPlatformFee, 88.0, 'afterPlatformFee should be 88.00');
  assert.strictEqual(breakdown.foundationAmount, 57.2, 'foundationAmount should be 57.20');
  assert.strictEqual(breakdown.companyAmount, 30.8, 'companyAmount should be 30.80');

  console.log('Happy path test passed');
})();

// Rounding edge case test
(() => {
  const amount = 10.33; // ₹10.33
  const platformFeePercent = 12; // 12%
  const foundationSharePercent = 70; // 70% of remaining

  const breakdown = calculateBreakdown(amount, platformFeePercent, foundationSharePercent);

  // Compute expected using same algorithm to confirm deterministic rounding
  const expectedPlatformFee = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
  const expectedAfterPlatformFee = Math.round((amount - expectedPlatformFee) * 100) / 100;
  const expectedFoundation = Math.round(expectedAfterPlatformFee * (foundationSharePercent / 100) * 100) / 100;
  const expectedCompany = Math.round((expectedAfterPlatformFee - expectedFoundation) * 100) / 100;

  assert.ok(almostEqual(breakdown.platformFee, expectedPlatformFee));
  assert.ok(almostEqual(breakdown.afterPlatformFee, expectedAfterPlatformFee));
  assert.ok(almostEqual(breakdown.foundationAmount, expectedFoundation));
  assert.ok(almostEqual(breakdown.companyAmount, expectedCompany));

  console.log('Rounding edge case test passed');
})();

console.log('All donation breakdown tests passed');
