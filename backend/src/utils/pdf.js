import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { storage } from "../config/firebase.js";

export const createScoreReportPdf = async ({ userId, score, tier, breakdown }) => {
  const verificationUrl = `https://graamsetu.example/verify/${userId}/${Date.now()}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl);

  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.fontSize(20).text("GraamSetu Credit Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`User ID: ${userId}`);
  doc.text(`Score: ${score}`);
  doc.text(`Tier: ${tier}`);
  doc.moveDown();
  doc.text("Breakdown:");
  Object.entries(breakdown).forEach(([key, value]) => {
    doc.text(`- ${key}: ${value}`);
  });

  doc.moveDown();
  doc.image(Buffer.from(qrDataUrl.split(",")[1], "base64"), { fit: [100, 100] });
  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const filePath = `reports/${userId}/${uuidv4()}.pdf`;
  const bucket = storage.bucket();
  const file = bucket.file(filePath);
  await file.save(pdfBuffer, { contentType: "application/pdf" });
  await file.makePublic();
  return file.publicUrl();
};
