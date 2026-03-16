import {
  getRightsBySituation,
  getMinimumWage,
  getConsumerHelp,
  reportFraud,
  getFraudByDistrict,
  getGlossaryTerms,
  getLegalAidCenters,
  chatbotQuery,
} from "../services/rightsService.js";

export const rightsBySituationController = async (req, res, next) => {
  try {
    const data = await getRightsBySituation(req.params.type, req.query.lang || "en");
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const minimumWageController = async (req, res, next) => {
  try {
    const data = await getMinimumWage(req.query.state, req.query.occupation);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const consumerHelpController = async (req, res, next) => {
  try {
    const data = await getConsumerHelp(req.params.issue);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const reportFraudController = async (req, res, next) => {
  try {
    const data = await reportFraud(req.user.uid, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const districtFraudController = async (req, res, next) => {
  try {
    const data = await getFraudByDistrict(req.params.district);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const glossaryController = async (req, res, next) => {
  try {
    const data = await getGlossaryTerms(req.query.search);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const legalAidController = async (req, res, next) => {
  try {
    const data = await getLegalAidCenters(req.query.state, req.query.district);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const chatbotQueryController = async (req, res, next) => {
  try {
    const data = await chatbotQuery(req.user.uid, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
