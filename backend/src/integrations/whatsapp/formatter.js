// WhatsApp response formatter utilities

export function formatHelpMenu() {
  return [
    "Welcome to GraamSetu WhatsApp assistant!",
    "",
    "You can type these commands:",
    "",
    "HAQDAR - Check eligible government schemes",
    "BACHAT - View your savings goals",
    "VIDHI  - Get legal help options",
    "FRAUD  - Report a scam or fraud",
    "HELP   - Show this help menu again",
  ].join("\n");
}

export function formatHaqdarResponse(schemes) {
  if (!Array.isArray(schemes) || schemes.length === 0) {
    return [
      "No active eligible schemes found for your profile.",
      "",
      "You can type HELP to see all available commands.",
    ].join("\n");
  }

  const lines = [
    "Eligible schemes based on your profile:",
    "",
  ];

  schemes.slice(0, 5).forEach((scheme, index) => {
    const name = scheme.name || scheme.schemeName || "Scheme";
    const amount = scheme.benefitAmount || scheme.amount || null;
    const shortDesc = scheme.shortDescription || scheme.description || "";

    lines.push(
      `${index + 1}. ${name}` + (amount ? ` (Benefit: \\u20b9${amount})` : "")
    );
    if (shortDesc) {
      lines.push(`   - ${shortDesc}`);
    }
    lines.push("");
  });

  lines.push("Reply HAQDAR again anytime to refresh your schemes.");
  return lines.join("\n");
}

export function formatBachatResponse(goals) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return [
      "You don't have any active savings goals yet.",
      "",
      "Open the GraamSetu app to create a new BachatBox goal.",
    ].join("\n");
  }

  const lines = [
    "Your active BachatBox savings goals:",
    "",
  ];

  goals.slice(0, 5).forEach((goal, index) => {
    const name = goal.name || goal.title || "Goal";
    const target = goal.targetAmount || goal.target || 0;
    const saved = goal.savedAmount || goal.current || 0;

    lines.push(
      `${index + 1}. ${name} - Saved \\u20b9${saved} / \\u20b9${target}`
    );
  });

  lines.push("");
  lines.push("Open the app for full goal details and next steps.");
  return lines.join("\n");
}

export function formatVidhiOptions() {
  return [
    "VidhiSahayak - Legal Help Options:",
    "",
    "We recommend using the GraamSetu app for full legal flows.",
    "On WhatsApp you can:",
    "- Type FRAUD to report a scam",
    "- Type VIDHI again for this menu",
    "- Use the app to see detailed rights and complaint letters",
  ].join("\n");
}

export function formatFraudIntro() {
  return [
    "Fraud / Scam Reporting:",
    "",
    "If this is urgent, you should also call 1930 (National Helpline).",
    "",
    "In the app you can file a detailed fraud report with location and screenshots.",
    "On WhatsApp, please share a short description of what happened.",
  ].join("\n");
}

export function formatMissingUser(phoneNumber) {
  return [
    "We could not find a GraamSetu account linked to this WhatsApp number.",
    "",
    `WhatsApp number: ${phoneNumber || "unknown"}`,
    "",
    "Please register or update your mobile number in the GraamSetu app, then try again.",
  ].join("\n");
}

export function formatUnknownCommand() {
  return [
    "Sorry, I did not understand that command.",
    "",
    formatHelpMenu(),
  ].join("\n\n");
}

export function formatGenericError() {
  return [
    "Something went wrong while processing your request.",
    "",
    "Please try again in some time or use the GraamSetu app.",
  ].join("\n");
}
