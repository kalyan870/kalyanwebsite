import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookmarkCheck,
  Check,
  Copy,
  Globe,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

const AI_SESSIONS_STORAGE_KEY = "kalyan_ai_lab_sessions_v1";

interface SavedAiSession {
  id: string;
  mode: "chat" | "search";
  model: string;
  title: string;
  lastPrompt: string;
  lastResponse: string;
}

type LabTab = "chat" | "search" | "voice";
type ChatModel = "gemini-4-hydrogen" | "gemini-3.1-flash-lite";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  model?: string;
}

interface GroundedSource {
  uri: string;
  title: string;
}

interface VoiceTurn {
  id: string;
  speaker: "You" | "Gemini Live";
  text: string;
}

const STARTER_CHAT_PROMPTS = [
  "Explain how AgentFlow AI handles multi-provider LLM fallback and DAG routing.",
  "Compare Hybrid Vector + BM25 search vs dense-only retrieval in Enterprise RAG.",
  "How does django-fetch-guard prevent N+1 ORM regressions in Django REST?",
];

const STARTER_SEARCH_QUERIES = [
  "Latest LangGraph stateful multi-agent orchestration best practices 2026",
  "Qdrant hybrid search sparse dense vector benchmarks",
  "FastAPI SSE streaming patterns with React 19",
];

function float32ToPcmBase64(input: Float32Array): string {
  const bytes = new Uint8Array(input.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function pcmBase64ToFloat32(base64: string): Float32Array<ArrayBuffer> {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const floats = new Float32Array(new ArrayBuffer(sampleCount * 4));
  for (let i = 0; i < sampleCount; i++) {
    floats[i] = view.getInt16(i * 2, true) / 32768;
  }
  return floats;
}

export default function AiLabSection() {
  const [aiSessions, setAiSessions] = useState<SavedAiSession[]>(() => {
    try {
      const raw = localStorage.getItem(AI_SESSIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<LabTab>("chat");

  // --- Multi-Turn Chat State ---
  const [chatModel, setChatModel] = useState<ChatModel>("gemini-4-hydrogen");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      model: "gemini-4-hydrogen",
      text: "Ask me anything about Saragadam Kalyan's AI projects (AgentFlow AI, InterviewIQ AI, Enterprise RAG), technical architecture choices, or engineering background.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Search Grounding State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<GroundedSource[]>([]);

  // --- Live Voice State ---
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceConnecting, setVoiceConnecting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>([]);

  // Refs for Web Audio + WebSocket closures
  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const voiceActiveRef = useRef(false);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const stopPlaybackQueue = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already-stopped source
      }
    });
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  }, []);

  const stopVoiceSession = useCallback(() => {
    voiceActiveRef.current = false;
    setVoiceActive(false);
    setVoiceConnecting(false);
    stopPlaybackQueue();

    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      try {
        processorRef.current.disconnect();
      } catch {
        // Ignore disconnect error
      }
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (inputCtxRef.current) {
      void inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      void outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore close error
      }
      wsRef.current = null;
    }
  }, [stopPlaybackQueue]);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  const startVoiceSession = useCallback(async () => {
    if (voiceActiveRef.current || voiceConnecting) return;
    setVoiceError(null);
    setVoiceConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live-voice`);
      wsRef.current = ws;

      const appendVoiceText = (speaker: "You" | "Gemini Live", chunk: string) => {
        const clean = chunk.trim();
        if (!clean) return;
        setVoiceTurns((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.speaker === speaker) {
            return [
              ...prev.slice(0, -1),
              { ...last, text: `${last.text} ${clean}`.trim() },
            ];
          }
          return [...prev.slice(-11), { id: `vt_${Date.now()}`, speaker, text: clean }];
        });
      };

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (!voiceActiveRef.current || ws.readyState !== WebSocket.OPEN) return;
          const pcm = event.inputBuffer.getChannelData(0);
          const encoded = float32ToPcmBase64(pcm);
          ws.send(JSON.stringify({ audio: encoded }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            ready?: boolean;
            audio?: string;
            interrupted?: boolean;
            inputTranscript?: string;
            outputTranscript?: string;
            error?: string;
            closed?: boolean;
          };

          if (msg.ready) {
            voiceActiveRef.current = true;
            setVoiceConnecting(false);
            setVoiceActive(true);
          }
          if (msg.error) {
            setVoiceError(msg.error);
            stopVoiceSession();
            return;
          }
          if (msg.closed) {
            stopVoiceSession();
            return;
          }
          if (msg.interrupted) {
            stopPlaybackQueue();
          }
          if (msg.inputTranscript) {
            appendVoiceText("You", msg.inputTranscript);
          }
          if (msg.outputTranscript) {
            appendVoiceText("Gemini Live", msg.outputTranscript);
          }
          if (msg.audio && outputCtxRef.current) {
            const floatData = pcmBase64ToFloat32(msg.audio);
            if (floatData.length > 0) {
              const ctx = outputCtxRef.current;
              const audioBuffer = ctx.createBuffer(1, floatData.length, 24000);
              audioBuffer.copyToChannel(floatData, 0);

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);

              const now = ctx.currentTime;
              if (nextStartTimeRef.current < now) {
                nextStartTimeRef.current = now;
              }
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
              source.onended = () => {
                activeSourcesRef.current.delete(source);
              };
            }
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onerror = () => {
        setVoiceError("WebSocket connection error while connecting to Gemini Live.");
        stopVoiceSession();
      };

      ws.onclose = () => {
        if (voiceActiveRef.current) {
          stopVoiceSession();
        }
      };
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Microphone access is required for Live Voice conversations.";
      setVoiceError(msg);
      stopVoiceSession();
    }
  }, [stopPlaybackQueue, stopVoiceSession, voiceConnecting]);

  const sendChatMessage = useCallback(
    async (promptOverride?: string) => {
      const text = (promptOverride ?? chatInput).trim();
      if (!text || chatLoading) return;

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        text,
      };
      const nextThread = [...chatMessages, userMsg];
      setChatMessages(nextThread);
      if (!promptOverride) setChatInput("");
      setChatLoading(true);
      setChatError(null);

      try {
        const res = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: chatModel,
            thinkingLevel: chatModel === "gemini-4-hydrogen" ? "LOW" : undefined,
            messages: nextThread.map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Unable to reach Gemini chat API.");
        }
        setChatMessages((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}`,
            role: "model",
            model: data.model || chatModel,
            text: data.text,
          },
        ]);
      } catch (error) {
        setChatError(error instanceof Error ? error.message : "Failed to generate reply.");
      } finally {
        setChatLoading(false);
      }
    },
    [chatInput, chatLoading, chatMessages, chatModel]
  );

  const runGroundedSearch = useCallback(
    async (queryOverride?: string) => {
      const q = (queryOverride ?? searchQuery).trim();
      if (!q || searchLoading) return;
      if (queryOverride) setSearchQuery(queryOverride);
      setSearchLoading(true);
      setSearchError(null);

      try {
        const res = await fetch("/api/gemini/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Search grounding request failed.");
        }
        setSearchAnswer(data.text || "");
        setSearchSources(Array.isArray(data.sources) ? data.sources : []);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : "Search failed.");
      } finally {
        setSearchLoading(false);
      }
    },
    [searchLoading, searchQuery]
  );

  const persistSessions = (next: SavedAiSession[]) => {
    setAiSessions(next);
    try {
      localStorage.setItem(AI_SESSIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  };

  const deleteAiSession = (id: string) => {
    persistSessions(aiSessions.filter((s) => s.id !== id));
  };

  const handleSaveCurrentSession = (mode: "chat" | "search") => {
    if (mode === "chat") {
      const lastUser = [...chatMessages].reverse().find((m) => m.role === "user");
      const lastModel = [...chatMessages].reverse().find((m) => m.role === "model");
      if (!lastUser || !lastModel) return;
      const entry: SavedAiSession = {
        id: `sess_${Date.now()}`,
        mode: "chat",
        model: chatModel,
        title: lastUser.text.slice(0, 80),
        lastPrompt: lastUser.text,
        lastResponse: lastModel.text,
      };
      persistSessions([entry, ...aiSessions].slice(0, 20));
    } else if (searchQuery.trim() && searchAnswer) {
      const entry: SavedAiSession = {
        id: `sess_${Date.now()}`,
        mode: "search",
        model: "gemini-4-hydrogen",
        title: `Search: ${searchQuery.trim().slice(0, 70)}`,
        lastPrompt: searchQuery.trim(),
        lastResponse: searchAnswer,
      };
      persistSessions([entry, ...aiSessions].slice(0, 20));
    }
    setSaveFeedback("Saved to session history");
    window.setTimeout(() => setSaveFeedback(null), 2400);
  };

  return (
    <section id="ai-lab" className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28">
      <div className="editorial-wrap">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-[#4d3fab] font-semibold mb-3">
              INTERACTIVE AI ENGINEERING WORKBENCH · SERVER-SIDE GEMINI
            </p>
            <h2
              className="text-[clamp(2.1rem,4.3vw,3.6rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Ask the portfolio <span className="bg-[#9084ff] text-black px-2 inline-block">Gemini Lab.</span>
            </h2>
          </div>

          <p className="text-sm text-black/75 max-w-md leading-relaxed">
            Run multi-turn technical Q&amp;A over Kalyan&apos;s builds, query live web engineering
            references with Google Search grounding, or open a real-time 16kHz/24kHz Gemini Live
            voice session.
          </p>
        </div>

        {/* Main Brutalist Workbench Container */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_#000]">
          {/* Workbench Tab Bar */}
          <div className="border-b-2 border-black bg-[#f4eff2] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Gemini AI Lab modes" className="flex flex-wrap gap-2">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "chat"}
                onClick={() => setActiveTab("chat")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border border-black transition-colors ${
                  activeTab === "chat"
                    ? "bg-black text-[#dff247]"
                    : "bg-white text-black hover:bg-[#dff247]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Multi-Turn Chat</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "search"}
                onClick={() => setActiveTab("search")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border border-black transition-colors ${
                  activeTab === "search"
                    ? "bg-black text-[#dff247]"
                    : "bg-white text-black hover:bg-[#dff247]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Google Search Grounding</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "voice"}
                onClick={() => setActiveTab("voice")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border border-black transition-colors ${
                  activeTab === "voice"
                    ? "bg-black text-[#dff247]"
                    : "bg-white text-black hover:bg-[#dff247]"
                }`}
              >
                <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Live Voice (PCM)</span>
              </button>
            </div>

            {/* Session Status */}
            <div className="flex items-center gap-2">
              {saveFeedback ? (
                <span className="font-mono-code text-[11px] font-bold bg-[#dff247] border border-black px-2.5 py-1">
                  {saveFeedback}
                </span>
              ) : (
                <span className="font-mono-code text-[11px] font-semibold text-black/75 border border-black/25 bg-white px-2.5 py-1">
                  Open Access · No sign-in required
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_0.75fr]">
            {/* Left Primary Interactive Panel */}
            <div className="p-5 md:p-7 border-b-2 lg:border-b-0 lg:border-r-2 border-black">
              {activeTab === "chat" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-[11px] font-bold text-black/70">
                        MODEL:
                      </span>
                      <select
                        value={chatModel}
                        onChange={(e) => setChatModel(e.target.value as ChatModel)}
                        aria-label="Select Gemini chat model"
                        className="bg-[#f4eff2] border border-black px-2.5 py-1.5 font-mono-code text-xs font-semibold text-black"
                      >
                        <option value="gemini-4-hydrogen">gemini-4-hydrogen (Balanced Flash)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
                      </select>
                    </div>

                    {chatMessages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleSaveCurrentSession("chat")}
                        className="inline-flex items-center gap-1.5 bg-[#dff247] text-black border border-black px-3 py-1.5 text-xs font-bold hover:bg-black hover:text-[#dff247] transition-colors"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Save Thread</span>
                      </button>
                    )}
                  </div>

                  {/* Starter Prompts */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {STARTER_CHAT_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendChatMessage(prompt)}
                        className="text-left font-mono-code text-[11px] border border-black/30 bg-[#f4eff2] px-2.5 py-1.5 hover:bg-[#dff247] hover:border-black transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Conversation Thread */}
                  <div
                    ref={chatScrollRef}
                    className="h-80 overflow-y-auto border border-black bg-[#faf8f9] p-4 space-y-4 mb-4"
                  >
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3.5 border border-black break-words ${
                          msg.role === "user"
                            ? "bg-[#dff247]/35 ml-3 sm:ml-14"
                            : "bg-white mr-3 sm:mr-10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono-code text-[10px] font-bold text-[#4d3fab]">
                            {msg.role === "user"
                              ? "YOU"
                              : `GEMINI · ${msg.model || chatModel}`}
                          </span>
                          {msg.role === "model" && (
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard?.writeText(msg.text);
                                setCopiedId(msg.id);
                                window.setTimeout(() => setCopiedId(null), 1600);
                              }}
                              className="inline-flex items-center gap-1 font-mono-code text-[10px] text-black/70 hover:text-black"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3" aria-hidden="true" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" aria-hidden="true" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-black whitespace-pre-wrap m-0">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="p-3.5 border border-black bg-white mr-10 font-mono-code text-xs text-black/70">
                        Generating response with {chatModel}...
                      </div>
                    )}
                  </div>

                  {chatError && (
                    <div className="border border-black bg-[#de4ba4]/20 px-4 py-2.5 text-xs font-semibold text-black mb-3">
                      {chatError}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendChatMessage();
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about LangGraph, RAG benchmarks, FastAPI, or Kalyan's experience..."
                      className="min-w-0 flex-1 bg-white border border-black px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:outline-3 focus:outline-[#9084ff]"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="inline-flex items-center justify-center gap-1.5 bg-black text-[#f4eff2] border border-black px-5 py-2.5 text-xs font-bold hover:bg-[#dff247] hover:text-black disabled:opacity-50 transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "search" && (
                <div>
                  <p className="text-sm text-black/80 mb-4 leading-relaxed">
                    Runs <code className="font-mono-code text-xs bg-[#f4eff2] px-1.5 py-0.5 border border-black/20">gemini-4-hydrogen</code>{" "}
                    with live <strong>Google Search grounding</strong> so technical queries return
                    up-to-date answers with clickable citation URLs.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {STARTER_SEARCH_QUERIES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void runGroundedSearch(q)}
                        className="text-left font-mono-code text-[11px] border border-black/30 bg-[#f4eff2] px-2.5 py-1.5 hover:bg-[#dff247] hover:border-black transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void runGroundedSearch();
                    }}
                    className="flex flex-col sm:flex-row gap-2 mb-5"
                  >
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search the live web with Gemini Search grounding..."
                      className="min-w-0 flex-1 bg-white border border-black px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:outline-3 focus:outline-[#9084ff]"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading || searchQuery.trim().length < 3}
                      className="inline-flex items-center justify-center gap-1.5 bg-black text-[#f4eff2] border border-black px-5 py-2.5 text-xs font-bold hover:bg-[#dff247] hover:text-black disabled:opacity-50 transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{searchLoading ? "Searching..." : "Search Grounded"}</span>
                    </button>
                  </form>

                  {searchError && (
                    <div className="border border-black bg-[#de4ba4]/20 px-4 py-2.5 text-xs font-semibold text-black mb-4">
                      {searchError}
                    </div>
                  )}

                  {searchAnswer && (
                    <div className="border border-black bg-[#faf8f9] p-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-code text-[10px] font-bold text-[#4d3fab]">
                          GROUNDED RESPONSE · GOOGLE SEARCH
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentSession("search")}
                          className="inline-flex items-center gap-1 font-mono-code text-[11px] font-bold bg-[#dff247] border border-black px-2.5 py-1"
                        >
                          <BookmarkCheck className="w-3 h-3" aria-hidden="true" />
                          <span>Save Search</span>
                        </button>
                      </div>

                      <p className="text-sm leading-relaxed text-black whitespace-pre-wrap m-0">
                        {searchAnswer}
                      </p>

                      {searchSources.length > 0 && (
                        <div className="border-t border-black/15 pt-3">
                          <p className="font-mono-code text-[10px] font-bold text-black/70 mb-2">
                            GROUNDED WEB SOURCES ({searchSources.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {searchSources.map((src) => (
                              <a
                                key={src.uri}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2 bg-white border border-black/30 px-3 py-2 text-xs font-semibold text-black hover:bg-[#dff247] hover:border-black transition-colors"
                              >
                                <span className="truncate">{src.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "voice" && (
                <div>
                  <div className="border border-black bg-[#16151f] text-[#f4eff2] p-5 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="font-mono-code text-[10px] tracking-[0.08em] text-[#dff247] mb-1">
                          GEMINI 3.8 LIVE · WEBSOCKET AUDIO BRIDGE
                        </p>
                        <h3 className="text-lg font-extrabold text-[#f4eff2]">
                          Bidirectional Real-Time Voice Assistant
                        </h3>
                      </div>

                      {!voiceActive ? (
                        <button
                          type="button"
                          onClick={() => void startVoiceSession()}
                          disabled={voiceConnecting}
                          className="inline-flex items-center gap-2 bg-[#dff247] text-black border border-[#dff247] px-4 py-2.5 text-xs font-bold hover:bg-white transition-colors disabled:opacity-60"
                        >
                          <Mic className="w-4 h-4" aria-hidden="true" />
                          <span>
                            {voiceConnecting ? "Connecting Audio..." : "Start Voice Session"}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopVoiceSession}
                          className="inline-flex items-center gap-2 bg-[#de4ba4] text-black border border-[#de4ba4] px-4 py-2.5 text-xs font-bold hover:bg-white transition-colors"
                        >
                          <MicOff className="w-4 h-4" aria-hidden="true" />
                          <span>End Voice Session</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#f4eff2]/75 leading-relaxed m-0">
                      Streams raw 16kHz little-endian PCM microphone audio over WebSocket to{" "}
                      <code className="font-mono-code text-[#9084ff]">gemini-3.8-live</code> and
                      schedules 24kHz PCM spoken replies seamlessly with automatic interruption
                      handling.
                    </p>
                  </div>

                  {voiceError && (
                    <div className="border border-black bg-[#de4ba4]/20 px-4 py-2.5 text-xs font-semibold text-black mb-4">
                      {voiceError}
                    </div>
                  )}

                  <div className="border border-black bg-[#faf8f9] p-4 h-56 overflow-y-auto space-y-2.5">
                    <p className="font-mono-code text-[10px] font-bold text-black/65 m-0">
                      LIVE AUDIO TRANSCRIPT ({voiceActive ? "STREAMING" : "STANDBY"})
                    </p>
                    {voiceTurns.length === 0 ? (
                      <p className="text-xs text-black/60 pt-2">
                        Start a voice session and ask about Kalyan&apos;s projects or AI systems
                        engineering.
                      </p>
                    ) : (
                      voiceTurns.map((turn) => (
                        <div
                          key={turn.id}
                          className={`p-2.5 border border-black/25 text-xs ${
                            turn.speaker === "You" ? "bg-[#dff247]/30" : "bg-white"
                          }`}
                        >
                          <span className="font-mono-code font-bold text-[#4d3fab] mr-2">
                            {turn.speaker}:
                          </span>
                          <span>{turn.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Saved Sessions Drawer */}
            <aside className="bg-[#f4eff2] p-5 md:p-6 flex flex-col justify-between">
              <div>
                <p className="font-mono-code text-[11px] font-bold text-black mb-1">
                  SAVED SESSIONS
                </p>
                <p className="text-xs text-black/70 mb-4 leading-relaxed">
                  Save any Q&amp;A thread or grounded search locally in your browser to revisit
                  later — no account needed.
                </p>

                {aiSessions.length === 0 ? (
                  <div className="bg-white border border-black/30 p-4 text-xs text-black/70">
                    No saved sessions yet. Run a chat or grounded search and click{" "}
                    <strong>Save Thread</strong>.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {aiSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="bg-white border border-black p-3 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (sess.mode === "search") {
                                setActiveTab("search");
                                setSearchQuery(sess.lastPrompt);
                                setSearchAnswer(sess.lastResponse);
                              } else {
                                setActiveTab("chat");
                                setChatMessages([
                                  { id: `u_${sess.id}`, role: "user", text: sess.lastPrompt },
                                  {
                                    id: `m_${sess.id}`,
                                    role: "model",
                                    model: sess.model,
                                    text: sess.lastResponse,
                                  },
                                ]);
                              }
                            }}
                            className="text-left text-xs font-extrabold text-black hover:text-[#4d3fab] line-clamp-2"
                          >
                            {sess.title}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAiSession(sess.id)}
                            aria-label={`Delete saved session ${sess.title}`}
                            className="text-black/55 hover:text-[#de4ba4] p-0.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-mono-code text-[10px] text-black/65 m-0">
                          {sess.mode.toUpperCase()} · {sess.model}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-black/15 font-mono-code text-[10px] text-black/65">
                ENDPOINTS: /api/gemini/chat · /api/gemini/search · WS /api/live-voice
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
