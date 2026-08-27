import express from "express";
import helmet from "helmet";

import { corsMiddleware } from "./config/cors.js";

const app = express();

app.use(helmet());

app.use(corsMiddleware);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

export default app;