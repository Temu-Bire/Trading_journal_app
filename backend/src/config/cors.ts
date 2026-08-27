import cors from "cors";
import { env } from "./env.js";

export const corsMiddleware = cors({
  origin: env.clientUrl,
  credentials: true,
});