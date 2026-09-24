import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value === "REPLACE_ME") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  googleMapsApiKey: requireEnv("GOOGLE_MAPS_API_KEY"),
  port: Number(process.env.PORT) || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};
