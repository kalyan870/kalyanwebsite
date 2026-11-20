import express from "express";
import { createApiRouter } from "../src/server/apiRouter.js";

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use("/api", createApiRouter());

export default app;
