function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function buildBillingBreakdown(appointment, overrides = {}) {
  const consultation = toNumber(overrides.consultation, toNumber(appointment?.billing?.consultation, toNumber(appointment?.amount, 0)));
  const lab = toNumber(overrides.lab, toNumber(appointment?.billing?.lab, 0));
  const medicine = toNumber(overrides.medicine, toNumber(appointment?.billing?.medicine, 0));
  const gstPercent = toNumber(overrides.gstPercent, toNumber(appointment?.billing?.gstPercent, 0));
  const subtotal = round2(Math.max(0, consultation + lab + medicine));
  const gstAmount = round2((subtotal * Math.max(0, gstPercent)) / 100);
  const total = round2(subtotal + gstAmount);

  return {
    consultation: round2(Math.max(0, consultation)),
    lab: round2(Math.max(0, lab)),
    medicine: round2(Math.max(0, medicine)),
    subtotal,
    gstPercent: round2(Math.max(0, gstPercent)),
    gstAmount,
    total,
  };
}

function toInvoiceItems(billing) {
  return [
    { label: "Consultation", category: "consultation", amount: billing.consultation },
    { label: "Lab", category: "lab", amount: billing.lab },
    { label: "Medicine", category: "medicine", amount: billing.medicine },
  ].filter((item) => item.amount > 0);
}

module.exports = {
  buildBillingBreakdown,
  toInvoiceItems,
  round2,
};
