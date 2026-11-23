import express from "express";
import { createApiRouter } from "../src/server/apiRouter.js";
import { createGeminiRouter } from "../src/server/geminiRouter.js";

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use("/api/gemini", createGeminiRouter());
app.use("/api", createApiRouter());

export default app;
