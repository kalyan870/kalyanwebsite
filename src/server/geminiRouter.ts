import express from "express";
import type http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  GoogleGenAI,
  Modality,
  ThinkingLevel,
  type Content,
  type LiveServerMessage,
} from "@google/genai";
import { CURATED_PROJECTS, PROFILE, RESUME_DATA } from "../data/kalyanData.ts";

const ALLOWED_CHAT_MODELS = new Set(["gemini-4-hydrogen", "gemini-3.1-flash-lite"]);

const PORTFOLIO_SYSTEM_INSTRUCTION = `You are the technical AI engineering guide on ${PROFILE.name}'s portfolio website (${PROFILE.handle}).
You answer questions concisely, accurately, and practically about Kalyan's engineering experience, curated GitHub projects, architecture decisions, and AI engineering topics.

Core Profile Context:
- Name: ${PROFILE.name} (${PROFILE.education})
- Focus: Agentic AI workflows, LangGraph multi-agent orchestration, Hybrid RAG & vector search (Qdrant, ChromaDB), local SLMs (Ollama), FastAPI, Django REST, React 19, TypeScript, Docker.
- Experience:
  ${RESUME_DATA.experience
    .map((exp) => `* ${exp.role} at ${exp.company} (${exp.period}): ${exp.bullets.join(" ")}`)
    .join("\n  ")}
- Featured Projects:
  ${CURATED_PROJECTS.map(
    (p) => `* ${p.title} (${p.category}, Stack: ${p.stack.join(", ")}): ${p.description} Architecture: ${p.architectureNote}`
  ).join("\n  ")}

Rules:
- Ground answers strictly in known engineering facts or general software engineering principles.
- Keep answers scannable with clean structure, short paragraphs, and direct technical clarity.`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment secrets. Add it in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function createGeminiRouter(): express.Router {
  const router = express.Router();

  // Multi-turn Gemini chat endpoint (non-paid models: gemini-4-hydrogen, gemini-3.1-flash-lite)
  router.post("/chat", async (req, res) => {
    try {
      const { messages, model, thinkingLevel } = req.body ?? {};
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Please provide at least one message." });
      }

      const selectedModel =
        typeof model === "string" && ALLOWED_CHAT_MODELS.has(model)
          ? model
          : "gemini-4-hydrogen";

      const contents: Content[] = messages
        .slice(-16)
        .filter(
          (m): m is { role: "user" | "model"; text: string } =>
            Boolean(m) &&
            (m.role === "user" || m.role === "model") &&
            typeof m.text === "string" &&
            m.text.trim().length > 0
        )
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text.trim().slice(0, 4000) }],
        }));

      if (contents.length === 0) {
        return res.status(400).json({ error: "Message text cannot be empty." });
      }

      const ai = getGeminiClient();

      const config: {
        systemInstruction: string;
        thinkingConfig?: { thinkingLevel: ThinkingLevel };
      } = {
        systemInstruction: PORTFOLIO_SYSTEM_INSTRUCTION,
      };

      if (selectedModel === "gemini-4-hydrogen") {
        const levelMap: Record<string, ThinkingLevel> = {
          LOW: ThinkingLevel.LOW,
          MEDIUM: ThinkingLevel.MEDIUM,
          HIGH: ThinkingLevel.HIGH,
        };
        const resolvedLevel =
          typeof thinkingLevel === "string" && levelMap[thinkingLevel]
            ? levelMap[thinkingLevel]
            : ThinkingLevel.LOW;
        config.thinkingConfig = { thinkingLevel: resolvedLevel };
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        return res.status(502).json({ error: "Model returned an empty response." });
      }

      return res.json({
        model: selectedModel,
        text: replyText,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate Gemini response.";
      console.error("Gemini /api/gemini/chat error:", error);
      return res.status(500).json({ error: message });
    }
  });

  // Google Search Grounding endpoint using gemini-4-hydrogen
  router.post("/search", async (req, res) => {
    try {
      const { query } = req.body ?? {};
      const cleanQuery = typeof query === "string" ? query.trim() : "";
      if (!cleanQuery || cleanQuery.length < 3) {
        return res.status(400).json({ error: "Please enter a search question (min 3 characters)." });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: cleanQuery.slice(0, 1000),
        config: {
          systemInstruction:
            "Provide concise, accurate, up-to-date technical answers grounded in Google Search results. Summarize clearly in plain structured paragraphs or bullet points.",
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = chunks
        .map((chunk) => chunk.web)
        .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
        .map((web) => ({
          uri: web.uri,
          title: web.title || web.uri,
        }));

      const seen = new Set<string>();
      const uniqueSources = sources.filter((src) => {
        if (seen.has(src.uri)) return false;
        seen.add(src.uri);
        return true;
      });

      return res.json({
        model: "gemini-4-hydrogen",
        text: response.text?.trim() || "No grounded answer generated.",
        sources: uniqueSources.slice(0, 8),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google Search grounding request failed.";
      console.error("Gemini /api/gemini/search error:", error);
      return res.status(500).json({ error: message });
    }
  });

  return router;
}

export function attachGeminiLiveWebSocket(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const reqUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (reqUrl.pathname === "/api/live-voice") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (clientWs) => {
    let liveSession: Awaited<ReturnType<GoogleGenAI["live"]["connect"]>> | null = null;
    let closed = false;

    const sendJson = (payload: Record<string, unknown>) => {
      if (!closed && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      const ai = getGeminiClient();
      liveSession = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction:
            `You are the spoken voice engineering guide on ${PROFILE.name}'s portfolio website. Speak clearly, naturally, and concisely about Kalyan's AI agents, RAG pipelines, FastAPI backends, and engineering background.`,
        },
        callbacks: {
          onopen: () => {
            sendJson({ ready: true });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendJson({ inputTranscript: content.inputTranscription.text });
            }
            if (content?.outputTranscription?.text) {
              sendJson({ outputTranscript: content.outputTranscription.text });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson({ audio: part.inlineData.data });
              }
            }
            if (content?.interrupted) {
              sendJson({ interrupted: true });
            }
          },
          onerror: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "Gemini Live session error.";
            sendJson({ error: msg });
          },
          onclose: () => {
            if (!closed) {
              sendJson({ closed: true });
            }
          },
        },
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to initialize Gemini Live session.";
      sendJson({ error: msg });
      clientWs.close();
      return;
    }

    clientWs.on("message", (raw) => {
      if (!liveSession || closed) return;
      try {
        const parsed = JSON.parse(raw.toString()) as { audio?: string; text?: string };
        if (typeof parsed.audio === "string" && parsed.audio.length > 0) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        } else if (typeof parsed.text === "string" && parsed.text.trim().length > 0) {
          liveSession.sendRealtimeInput({
            text: parsed.text.trim(),
          });
        }
      } catch {
        // Ignore malformed frame
      }
    });

    clientWs.on("close", () => {
      closed = true;
      try {
        liveSession?.close();
      } catch {
        // Ignore close error
      }
    });
  });
}
