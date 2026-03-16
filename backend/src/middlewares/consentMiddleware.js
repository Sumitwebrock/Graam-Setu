const financialConsentBySession = new Map();

export const attachConsent = (req, _res, next) => {
  const sessionId = req.headers["x-session-id"];
  const consent = req.headers["x-financial-consent"];

  if (sessionId && consent === "granted") {
    financialConsentBySession.set(sessionId, true);
  }

  req.financialConsent = sessionId ? financialConsentBySession.get(sessionId) === true : false;
  req.sessionId = sessionId;
  next();
};

export const requireFinancialConsent = (req, res, next) => {
  if (!req.financialConsent) {
    return res.status(403).json({
      message: "Financial data consent is required for this action.",
    });
  }
  return next();
};
