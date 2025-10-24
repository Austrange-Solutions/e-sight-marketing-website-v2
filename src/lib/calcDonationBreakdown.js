// Lightweight donation breakdown calculator (mirrors FoundationSettingsSchema.methods.calculateBreakdown)
function calculateBreakdown(amount, platformFeePercent, foundationSharePercent) {
  // amount: number (rupees), percents: numbers (0-100)
  const platformFee = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
  const afterPlatformFee = Math.round((amount - platformFee) * 100) / 100;

  const foundationAmount = Math.round(afterPlatformFee * (foundationSharePercent / 100) * 100) / 100;
  const companyAmount = Math.round((afterPlatformFee - foundationAmount) * 100) / 100;

  return {
    totalAmount: amount,
    platformFee,
    afterPlatformFee,
    foundationAmount,
    companyAmount,
    platformFeePercent,
    foundationSharePercent,
    companySharePercent: 100 - foundationSharePercent,
  };
}

module.exports = { calculateBreakdown };
