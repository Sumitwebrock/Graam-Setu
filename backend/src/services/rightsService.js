import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "../config/firebase.js";
import { getLegalChatbotResponse, translateText } from "./integrationService.js";

const fraudCollection = firestore.collection("fraud_reports");

const SITUATION_LIBRARY = {
  wages_not_paid: {
    title: "मजदूरी नहीं मिली",
    shortTitle: "Wages Not Paid",
    explanationHindi: "अगर आपने काम किया है तो तय मजदूरी समय पर मिलना आपका अधिकार है। मालिक मजदूरी रोक नहीं सकता।",
    rightsHindi: "आपका अधिकार: समय पर पूरी मजदूरी मिलना और बकाया राशि की मांग करना।",
    stepsHindi: [
      "काम के दिन, उपस्थिति, ठेका पर्ची या गवाह का रिकॉर्ड इकट्ठा करें।",
      "पहले नियोक्ता या ठेकेदार को लिखित या व्हाट्सऐप पर भुगतान मांग भेजें।",
      "भुगतान न मिले तो श्रम विभाग या लोक सेवा केंद्र से शिकायत दर्ज करें।",
    ],
    complaintWhereHindi: [
      "जिला श्रम कार्यालय",
      "श्रम निरीक्षक",
      "लोक सेवा केंद्र या जिला विधिक सेवा प्राधिकरण",
    ],
    helpline: "155214",
    tags: ["worker", "construction worker", "labour", "migrant worker"],
  },
  minimum_wage_violation: {
    title: "न्यूनतम मजदूरी से कम भुगतान",
    shortTitle: "Minimum Wage Violation",
    explanationHindi: "राज्य सरकार हर काम के लिए न्यूनतम मजदूरी तय करती है। इससे कम भुगतान करना गैरकानूनी है।",
    rightsHindi: "आपका अधिकार: राज्य द्वारा तय न्यूनतम मजदूरी से कम भुगतान नहीं किया जा सकता।",
    stepsHindi: [
      "अपने राज्य और काम की श्रेणी की न्यूनतम मजदूरी जांचें।",
      "वर्तमान भुगतान और कानूनी मजदूरी का अंतर लिखकर रखें।",
      "श्रम विभाग में शिकायत दें और बकाया मजदूरी की मांग करें।",
    ],
    complaintWhereHindi: ["राज्य श्रम विभाग", "जिला श्रम अधिकारी", "ई-श्रम सहायता केंद्र"],
    helpline: "14434",
    tags: ["worker", "construction worker", "farm worker", "labour"],
  },
  government_scheme_denied: {
    title: "सरकारी योजना से वंचित",
    shortTitle: "Government Scheme Denied",
    explanationHindi: "यदि आप पात्र हैं और फिर भी योजना नहीं मिली, तो कारण पूछना और शिकायत करना आपका अधिकार है।",
    rightsHindi: "आपका अधिकार: आवेदन की स्थिति, अस्वीकृति का कारण और पुनः अपील का अवसर।",
    stepsHindi: [
      "आवेदन नंबर, आधार, राशन कार्ड या पात्रता दस्तावेज साथ रखें।",
      "ब्लॉक या योजना कार्यालय से लिखित कारण मांगें।",
      "जन शिकायत पोर्टल, जिला कलेक्टर या लोक सेवा केंद्र में शिकायत दें।",
    ],
    complaintWhereHindi: ["ब्लॉक विकास कार्यालय", "जिला जन शिकायत प्रकोष्ठ", "CPGRAMS / जन सुनवाई"],
    helpline: "1076",
    tags: ["widow", "farmer", "senior citizen", "low income", "female"],
  },
  loan_harassment: {
    title: "लोन वसूली में परेशान करना",
    shortTitle: "Loan Harassment",
    explanationHindi: "कोई भी एजेंट धमकी, गाली, निजी फोटो मांगने या रात में परेशान करने का अधिकार नहीं रखता।",
    rightsHindi: "आपका अधिकार: सम्मानजनक वसूली प्रक्रिया और धमकी से सुरक्षा।",
    stepsHindi: [
      "कॉल रिकॉर्ड, संदेश और एजेंट का नाम सुरक्षित रखें।",
      "लिखित रूप से बैंक/एनबीएफसी को शिकायत भेजें।",
      "RBI शिकायत, पुलिस या साइबर हेल्पलाइन पर रिपोर्ट करें यदि धमकी या डेटा का दुरुपयोग हो।",
    ],
    complaintWhereHindi: ["बैंक / NBFC grievance cell", "RBI Sachet", "पुलिस / साइबर सेल"],
    helpline: "1930",
    tags: ["borrower", "low income", "self employed", "female"],
  },
  land_dispute: {
    title: "जमीन का विवाद",
    shortTitle: "Land Dispute",
    explanationHindi: "खसरा, खतौनी, रजिस्ट्री और सीमांकन दस्तावेज जमीन विवाद में सबसे महत्वपूर्ण साक्ष्य होते हैं।",
    rightsHindi: "आपका अधिकार: जमीन के रिकॉर्ड देखने, नकल लेने और सीमांकन मांगने का अधिकार।",
    stepsHindi: [
      "खसरा, खतौनी, रजिस्ट्री और पुरानी रसीदों की कॉपी निकालें।",
      "पटवारी / तहसील में सीमांकन के लिए आवेदन करें।",
      "जरूरत पड़े तो जिला विधिक सेवा प्राधिकरण या सिविल कोर्ट से मदद लें।",
    ],
    complaintWhereHindi: ["तहसील कार्यालय", "राजस्व विभाग", "जिला विधिक सेवा प्राधिकरण"],
    helpline: "15100",
    tags: ["farmer", "land owner", "widow"],
  },
  product_fraud: {
    title: "खराब या फर्जी सामान",
    shortTitle: "Product Fraud",
    explanationHindi: "खराब, नकली या वादे के अनुसार सेवा न मिलने पर आप रिफंड, रिप्लेसमेंट या शिकायत कर सकते हैं।",
    rightsHindi: "आपका अधिकार: सही जानकारी, सुरक्षित सामान और शिकायत निवारण।",
    stepsHindi: [
      "बिल, फोटो, पैकेट और विक्रेता का नाम संभालकर रखें।",
      "पहले दुकानदार या कंपनी से समाधान मांगें।",
      "समाधान न मिले तो राष्ट्रीय उपभोक्ता हेल्पलाइन या उपभोक्ता आयोग में शिकायत दें।",
    ],
    complaintWhereHindi: ["National Consumer Helpline", "जिला उपभोक्ता आयोग", "ड्रग इंस्पेक्टर (दवा मामले में)"],
    helpline: "1915",
    tags: ["consumer", "family", "female"],
  },
};

const SITUATION_ALIASES = {
  wage_delay: "wages_not_paid",
  wage_theft: "wages_not_paid",
  unpaid_wages: "wages_not_paid",
  minimum_wage: "minimum_wage_violation",
  scheme_denied: "government_scheme_denied",
  govt_scheme_denied: "government_scheme_denied",
  consumer_fraud: "product_fraud",
  cyber_fraud: "loan_harassment",
};

const MINIMUM_WAGE_DATA = {
  chhattisgarh: {
    "construction worker": 412,
    "agricultural worker": 355,
    "domestic worker": 320,
    driver: 468,
  },
  "uttar pradesh": {
    "construction worker": 397,
    "agricultural worker": 348,
    "domestic worker": 300,
    driver: 432,
  },
  bihar: {
    "construction worker": 382,
    "agricultural worker": 340,
    "domestic worker": 295,
    driver: 420,
  },
  maharashtra: {
    "construction worker": 510,
    "agricultural worker": 421,
    "domestic worker": 380,
    driver: 575,
  },
  rajasthan: {
    "construction worker": 421,
    "agricultural worker": 362,
    "domestic worker": 320,
    driver: 455,
  },
};

const CONSUMER_ISSUES = {
  defective_product: {
    issue: "Defective Product",
    issueHindi: "खराब सामान",
    explanationHindi: "अगर खरीदा गया सामान खराब है, जल्दी टूट गया है या वादे के अनुसार नहीं है, तो आप बदलवाने या पैसे वापस लेने के हकदार हैं।",
    rightsHindi: "आपका अधिकार: रिप्लेसमेंट, रिपेयर, रिफंड और शिकायत सुनवाई।",
    stepsHindi: [
      "बिल, वारंटी कार्ड और सामान की फोटो रखें।",
      "दुकानदार या कंपनी को लिखित शिकायत दें।",
      "समाधान न मिले तो 1915 पर कॉल करें या उपभोक्ता आयोग में शिकायत दें।",
    ],
    helpline: "1915",
  },
  fake_medicine: {
    issue: "Fake Medicine",
    issueHindi: "नकली दवा",
    explanationHindi: "नकली या एक्सपायर दवा बेचना गंभीर अपराध है। इससे स्वास्थ्य को खतरा होता है।",
    rightsHindi: "आपका अधिकार: सुरक्षित दवा, मेडिकल बिल और दवा की जांच की मांग।",
    stepsHindi: [
      "दवा का बिल, रैपर और बैच नंबर सुरक्षित रखें।",
      "नजदीकी ड्रग इंस्पेक्टर या स्वास्थ्य विभाग को तुरंत जानकारी दें।",
      "जरूरत हो तो उपभोक्ता शिकायत और पुलिस रिपोर्ट भी दर्ज करें।",
    ],
    helpline: "104",
  },
  service_fraud: {
    issue: "Service Fraud",
    issueHindi: "सेवा में धोखा",
    explanationHindi: "अगर सेवा का वादा कुछ और था लेकिन पैसा लेने के बाद सेवा नहीं मिली, तो आप शिकायत कर सकते हैं।",
    rightsHindi: "आपका अधिकार: सही सेवा, स्पष्ट शुल्क जानकारी और रिफंड।",
    stepsHindi: [
      "रसीद, स्क्रीनशॉट, कॉल रिकॉर्ड या चैट सुरक्षित रखें।",
      "कंपनी को लिखित शिकायत और रिफंड मांग भेजें।",
      "1915, बैंक चार्जबैक या साइबर सेल की मदद लें।",
    ],
    helpline: "1915",
  },
};

const LEGAL_GLOSSARY = [
  {
    term: "Minimum Wage",
    termHindi: "न्यूनतम मजदूरी",
    meaningHindi: "सरकार द्वारा तय वह सबसे कम मजदूरी जो नियोक्ता को देनी ही होती है।",
  },
  {
    term: "Consumer Complaint",
    termHindi: "उपभोक्ता शिकायत",
    meaningHindi: "खराब सामान, गलत सेवा या ठगी के खिलाफ की जाने वाली शिकायत।",
  },
  {
    term: "Insurance Claim",
    termHindi: "बीमा दावा",
    meaningHindi: "बीमा पॉलिसी के तहत नुकसान या घटना के बाद मांगी जाने वाली राशि।",
  },
  {
    term: "Nominee",
    termHindi: "नामांकित व्यक्ति",
    meaningHindi: "वह व्यक्ति जिसे खाते, बीमा या निवेश की राशि पाने के लिए नामित किया जाता है।",
  },
  {
    term: "FIR",
    termHindi: "प्रथम सूचना रिपोर्ट",
    meaningHindi: "पुलिस में दर्ज पहली आधिकारिक शिकायत जिससे आपराधिक जांच शुरू होती है।",
  },
  {
    term: "Legal Aid",
    termHindi: "निःशुल्क कानूनी सहायता",
    meaningHindi: "आर्थिक रूप से कमजोर या पात्र लोगों को मुफ्त कानूनी मदद।",
  },
];

const BASE_LEGAL_AID = [
  {
    type: "legal_aid_center",
    title: "जिला विधिक सेवा प्राधिकरण",
    distanceKm: 3,
    contactNumber: "15100",
  },
  {
    type: "labour_office",
    title: "जिला श्रम कार्यालय",
    distanceKm: 6,
    contactNumber: "155214",
  },
  {
    type: "consumer_court",
    title: "जिला उपभोक्ता आयोग",
    distanceKm: 9,
    contactNumber: "1915",
  },
];

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const resolveSituationKey = (type) => {
  const normalized = normalizeText(type).replace(/\s+/g, "_");
  return SITUATION_ALIASES[normalized] || normalized;
};

const resolveOccupationKey = (occupation) => {
  const normalized = normalizeText(occupation);
  if (normalized.includes("construction")) return "construction worker";
  if (normalized.includes("farm") || normalized.includes("agri")) return "agricultural worker";
  if (normalized.includes("domestic")) return "domestic worker";
  if (normalized.includes("driver")) return "driver";
  return normalized || "construction worker";
};

const buildLocalChatbotAnswer = (query) => {
  const normalized = normalizeText(query);
  const matchedEntry = Object.entries(SITUATION_LIBRARY).find(([key, value]) => {
    if (normalized.includes(key.replaceAll("_", " "))) {
      return true;
    }
    return value.title.includes(query) || value.shortTitle.toLowerCase().includes(normalized);
  });

  const selected = matchedEntry?.[1]
    || (normalized.includes("मजदूरी") || normalized.includes("wage") ? SITUATION_LIBRARY.minimum_wage_violation : null)
    || (normalized.includes("योजना") || normalized.includes("scheme") ? SITUATION_LIBRARY.government_scheme_denied : null)
    || (normalized.includes("loan") || normalized.includes("कर्ज") ? SITUATION_LIBRARY.loan_harassment : null)
    || SITUATION_LIBRARY.product_fraud;

  return `${selected.rightsHindi} क्या करें: 1. ${selected.stepsHindi[0]} 2. ${selected.stepsHindi[1]} 3. ${selected.stepsHindi[2]}`;
};

const buildSeedFraudAlerts = (district) => {
  const districtLabel = district || "आपके जिले";
  return [
    {
      id: `seed-loan-${normalizeText(districtLabel) || "default"}`,
      district: districtLabel,
      fraudType: "Loan App Fraud",
      description: `${districtLabel} में नकली लोन ऐप और OTP मांगने वाले कॉल की शिकायतें मिली हैं। OTP, PIN या फोटो शेयर न करें।`,
      timestamp: dayjs().subtract(1, "day").toISOString(),
      severity: "high",
      source: "district-alert-seed",
    },
    {
      id: `seed-scheme-${normalizeText(districtLabel) || "default"}`,
      district: districtLabel,
      fraudType: "Scheme Enrollment Fraud",
      description: `सरकारी योजना दिलाने के नाम पर फीस मांगना धोखा हो सकता है। पहले CSC या ब्लॉक कार्यालय से सत्यापन करें।`,
      timestamp: dayjs().subtract(3, "day").toISOString(),
      severity: "medium",
      source: "district-alert-seed",
    },
  ];
};

export const getRightsBySituation = async (type, language = "hi") => {
  const situationKey = resolveSituationKey(type);
  const selected = SITUATION_LIBRARY[situationKey] || SITUATION_LIBRARY.product_fraud;

  if (language === "hi") {
    return {
      situationKey,
      ...selected,
    };
  }

  return {
    situationKey,
    ...selected,
    title: await translateText(selected.title, language),
    explanationHindi: await translateText(selected.explanationHindi, language),
    rightsHindi: await translateText(selected.rightsHindi, language),
    stepsHindi: await Promise.all(selected.stepsHindi.map((step) => translateText(step, language))),
    complaintWhereHindi: await Promise.all(selected.complaintWhereHindi.map((item) => translateText(item, language))),
  };
};

export const getMinimumWage = async (state, occupation) => {
  const normalizedState = normalizeText(state) || "uttar pradesh";
  const occupationKey = resolveOccupationKey(occupation);
  const stateTable = MINIMUM_WAGE_DATA[normalizedState] || MINIMUM_WAGE_DATA["uttar pradesh"];
  const amountPerDay = stateTable[occupationKey] || Object.values(stateTable)[0];

  return {
    state: state || "Uttar Pradesh",
    occupation: occupation || "Construction Worker",
    amountPerDay,
    amountPerMonth: amountPerDay * 26,
    currency: "INR",
    explanationHindi: `इस श्रेणी के लिए अनुमानित न्यूनतम मजदूरी ₹${amountPerDay}/दिन है। सही दर जिले और कौशल श्रेणी के अनुसार बदल सकती है।`,
    source: "State labour notification (reference dataset)",
  };
};

export const getConsumerHelp = async (issue) => {
  const key = normalizeText(issue).replace(/\s+/g, "_");
  return CONSUMER_ISSUES[key] || CONSUMER_ISSUES.defective_product;
};

export const getGlossaryTerms = async (search = "") => {
  const normalized = normalizeText(search);
  if (!normalized) {
    return LEGAL_GLOSSARY;
  }

  return LEGAL_GLOSSARY.filter((item) => {
    const haystack = [item.term, item.termHindi, item.meaningHindi].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });
};

export const getLegalAidCenters = async (state, district) => {
  const districtLabel = district || "आपका जिला";
  const stateLabel = state || "आपका राज्य";

  return BASE_LEGAL_AID.map((item, index) => ({
    id: `${item.type}-${index + 1}`,
    type: item.type,
    title: item.title,
    location: `${districtLabel}, ${stateLabel}`,
    distance: `${item.distanceKm} km`,
    contactNumber: item.contactNumber,
    openHours: index === 0 ? "10 AM - 5 PM" : "10 AM - 6 PM",
  }));
};

export const reportFraud = async (uid, payload) => {
  const report = {
    reportId: uuidv4(),
    userId: uid,
    district: payload.district,
    state: payload.state,
    fraudType: payload.fraudType,
    description: payload.description,
    timestamp: dayjs().toISOString(),
    severity: payload.severity || "medium",
    status: "submitted",
  };
  await fraudCollection.doc(report.reportId).set(report);
  return report;
};

export const getFraudByDistrict = async (district) => {
  const snapshot = await fraudCollection.where("district", "==", district).orderBy("timestamp", "desc").get();
  const liveAlerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), source: "user-report" }));
  return liveAlerts.length > 0 ? liveAlerts : buildSeedFraudAlerts(district);
};

export const chatbotQuery = async (uid, payload) => {
  const reply = await getLegalChatbotResponse({ uid, query: payload.query, language: payload.language || "hi" });
  return {
    answer: reply.includes("Local legal guidance") ? buildLocalChatbotAnswer(payload.query) : reply,
    generatedAt: dayjs().toISOString(),
  };
};
