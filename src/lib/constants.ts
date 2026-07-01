import { CasteNormalized } from "./types";

export const SCHOOL_NAME = "Jijau English School Tungi (BK)";
export const SCHOOL_SHORT_NAME = "Jijau English School";
export const SCHOOL_LOCATION = "Tungi (BK)";
export const APP_NAME = "Jijau SchoolConnect";
export const SCHOOL_LOGO = "https://i.postimg.cc/28NcFfp7/Whats-App-Image-2026-04-12-at-1-57-07-PM.jpg";
export const SCHOOL_ADDRESS = "Tungi BK, Maharashtra, India";
export const SCHOOL_PHONE = "+91 9890522763";
export const SCHOOL_WHATSAPP = "919890522763";
export const SCHOOL_EMAIL = "info@jijau.school";

export const CASTE_OPTIONS = [
  "OPEN", "SC", "ST", "VJ/DT", "NT-B", "NT-C", "NT-D", "OBC", "SEBC", "TFWS", "ORPHAN", "EWS"
];

export const normalizeCaste = (input: string): CasteNormalized => {
  const upper = input.toUpperCase();
  if (upper.includes("OPEN")) return "OPEN";
  if (upper.includes("SC")) return "SC";
  if (upper.includes("ST")) return "ST";
  if (upper.includes("VJ") || upper.includes("DT")) return "VJ/DT";
  if (upper.includes("NT-B") || upper.includes("NT1")) return "NT-B";
  if (upper.includes("NT-C") || upper.includes("NT2")) return "NT-C";
  if (upper.includes("NT-D") || upper.includes("NT3")) return "NT-D";
  if (upper.includes("OBC")) return "OBC";
  if (upper.includes("SEBC")) return "SEBC";
  if (upper.includes("TFWS")) return "TFWS";
  if (upper.includes("EWS")) return "EWS";
  if (upper.includes("ORPHAN")) return "ORPHAN";
  
  return input as CasteNormalized;
};

export const DEFAULT_CREDENTIALS = {
  FOUNDER: { username: "jijau2026", password: "jijau@2026#" },
  ADMIN: { username: "prajwal77", password: "prajwal@77#" }
};
