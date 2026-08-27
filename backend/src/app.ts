import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./config/cors.js";
import apiRoutes from "./routes/index.js"
const app = express();

app.use(helmet());

app.use(corsMiddleware);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);
export default app;