import "dotenv/config";

const requiredEnvVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET", 
] as const;

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI as string,
  
  // Access Token
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",

  // Refresh Token 
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};