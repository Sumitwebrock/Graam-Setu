import {
  handleBachatCommand,
  handleFraudCommand,
  handleHaqdarCommand,
  handleVidhiCommand,
} from "./handlers.js";
import { formatHelpMenu, formatUnknownCommand } from "./formatter.js";

function normalizeCommand(text) {
  if (!text) return "";
  return String(text).trim().toUpperCase();
}

export async function routeWhatsAppMessage({ from, body }) {
  const command = normalizeCommand(body);

  switch (command) {
    case "HAQDAR":
      return await handleHaqdarCommand(from);
    case "BACHAT":
      return await handleBachatCommand(from);
    case "VIDHI":
      return await handleVidhiCommand(from);
    case "FRAUD":
      return await handleFraudCommand(from);
    case "HELP":
    case "HI":
    case "HELLO":
      return formatHelpMenu();
    default:
      return formatUnknownCommand();
  }
}
