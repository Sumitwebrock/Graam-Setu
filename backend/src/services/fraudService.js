const DISTRICT_AVG_MONTHLY_INCOME = {
  dhamtari: 18000,
  gariaband: 16000,
  bilaspur: 22000,
  raipur: 24000,
  durg: 23000,
  default: 18000,
};

const normalizeDistrict = (value) => String(value || "").trim().toLowerCase();

const getDistrictAverageIncome = (districtLikeValue) => {
  const district = normalizeDistrict(districtLikeValue);
  for (const [key, value] of Object.entries(DISTRICT_AVG_MONTHLY_INCOME)) {
    if (district.includes(key)) {
      return value;
    }
  }
  return DISTRICT_AVG_MONTHLY_INCOME.default;
};

export const detectFraudRisk = async (payload, verification = {}) => {
  const monthlyIncome = Number(payload.income || 0);
  const totalEmi = Number(payload.totalMonthlyEmi || 0);
  const activeLoans = payload.activeLoans === "4plus" ? 4 : Number(payload.activeLoans || 0);
  const highUpiActivity = Number(payload.upiTxn || 0) >= 3 || Number(payload.monthlyUpiInflowAmount || 0) > 30000;
  const bankAvailable = verification.bankVerified || payload.bankUsed30Days === "yes";
  const districtAverage = getDistrictAverageIncome(payload.location || payload.district || payload.village);

  const fraudFlags = [];
  let riskRank = 0;

  if (monthlyIncome > 0 && monthlyIncome < totalEmi) {
    fraudFlags.push("Income lower than total monthly EMI");
    riskRank = Math.max(riskRank, 3);
  }

  if (activeLoans > 5) {
    fraudFlags.push("Excessive number of active loans (>5)");
    riskRank = Math.max(riskRank, 2);
  }

  if (highUpiActivity && !bankAvailable) {
    fraudFlags.push("High UPI activity reported without active bank usage");
    riskRank = Math.max(riskRank, 2);
  }

  if (monthlyIncome > districtAverage * 3) {
    fraudFlags.push("Declared income significantly above district benchmark");
    riskRank = Math.max(riskRank, 2);
  }

  const fraudRisk = riskRank >= 3 ? "HIGH" : riskRank === 2 ? "MEDIUM" : "LOW";

  return {
    fraudRisk,
    fraudFlags,
  };
};
