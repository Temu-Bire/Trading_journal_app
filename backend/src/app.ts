import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./config/cors.js";
import apiRoutes from "./routes/index.js"
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import e from "express";
const app = express();

app.use(helmet());

app.use(corsMiddleware);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
export default app;