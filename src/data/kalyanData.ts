export type ProjectCategory =
  | "All"
  | "RAG & LLMs"
  | "AI Agents"
  | "Multimodal & CV"
  | "Full-Stack";

export type CertificateCategory = "All" | "AI & Cloud" | "Full-Stack & Data" | "Simulations";

export interface ProjectItem {
  id: string;
  repoSlug: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  stack: string[];
  description: string;
  architectureNote: string;
  repoUrl: string;
  liveUrl?: string;
  lastUpdated?: string;
  featured?: boolean;
}

export interface FocusDimension {
  id: string;
  number: string;
  shortLabel: string;
  kicker: string;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaUrl: string;
  accentLabel: string;
}

export interface SubstackPost {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  formattedDate: string;
  author: string;
  summary: string;
  coverImage: string | null;
  contentHtml: string;
  readTimeMinutes: number;
  tags: string[];
}

export interface LinkedInPostItem {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  url: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  type: string;
  desc: string;
  repoUrl?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  code: string;
  category: Exclude<CertificateCategory, "All">;
  url: string;
}

export const PROFILE = {
  name: "Saragadam Kalyan",
  shortName: "Kalyan",
  handle: "kalyan870",
  email: "saragdamkalyan068@gmail.com",
  phone: "+91-8919496141",
  location: "Visakhapatnam, India",
  education: "B.Tech CSE '28 · Vignan's Institute of Information Technology (CGPA 8.5 / 10.0)",
  roleLine: "AI ENGINEER · FULL-STACK DEVELOPER · B.TECH CSE '28",
  headline: "I build practical AI systems and full-stack web products.",
  bio: "I'm Saragadam Kalyan, a Computer Science student and AI engineer specializing in agentic AI workflows, LLM orchestration, RAG pipelines, and low-latency multimodal voice streaming. I ship production-ready automation systems with FastAPI, React 19, LangGraph, Docker, and CI/CD practices.",
  shortBioCopy:
    "Saragadam Kalyan is an AI Engineer, Full-Stack Developer, and Crio.Do Certified Applied AI Developer pursuing B.Tech CSE '28 at Vignan's Institute of Information Technology, India. He builds autonomous multi-agent graphs with LangGraph, hybrid vector & BM25 RAG systems, local SLMs with Ollama, and full-stack web applications.",
  links: {
    github: "https://github.com/kalyan870",
    githubRepos: "https://github.com/kalyan870?tab=repositories",
    linkedin: "https://www.linkedin.com/in/saragadamkalyan/",
    linkedinActivity: "https://www.linkedin.com/in/saragadamkalyan/recent-activity/all/",
    linkedinFeatured: "https://www.linkedin.com/in/saragadamkalyan/details/featured/",
    substack: "https://saragadamkalyan.substack.com/",
    kalyanhub: "https://kalyanhub.netlify.app/",
    portfolioLegacy: "https://kalyannexus.vercel.app/",
    resumePdf: "/assets/aistudio/Saragadam_Kalyan_AI_Engineer_Resume_405ec93d.pdf",
    support: "https://buymeacoffee.com/kalyan870",
  },
};

export const CORE_CAPABILITIES = [
  "Generative AI",
  "RAG Systems",
  "AI Agents",
  "Local SLMs",
  "FastAPI",
  "React & TypeScript",
  "Django",
  "Qdrant",
  "Ollama",
  "Docker",
];

export const FOCUS_DIMENSIONS: FocusDimension[] = [
  {
    id: "genai",
    number: "01",
    shortLabel: "Generative AI",
    kicker: "01 · GENERATIVE AI",
    title: "LLM workflows built for real users.",
    description:
      "Designing structured prompting pipelines, interactive explainers, and reliable LLM evaluation interfaces using OpenRouter, Gemini, and modern web frameworks.",
    highlights: ["Prompt orchestration", "Interactive explainers", "Structured outputs"],
    ctaLabel: "Explore LLM Explainer",
    ctaUrl: "https://llm-explainer-three.vercel.app/",
    accentLabel: "GitHub & Vercel",
  },
  {
    id: "rag",
    number: "02",
    shortLabel: "RAG & Retrieval",
    kicker: "02 · RAG & KNOWLEDGE SYSTEMS",
    title: "Grounded answers over messy documents.",
    description:
      "Building retrieval-augmented generation pipelines with hybrid semantic and keyword search, vector indexing in Qdrant, reranking, and hallucination checks.",
    highlights: ["Hybrid retrieval", "Reranking pipelines", "Codebase QA"],
    ctaLabel: "View RAG System Repo",
    ctaUrl: "https://github.com/kalyan870/rag-system",
    accentLabel: "Python · Qdrant",
  },
  {
    id: "agents",
    number: "03",
    shortLabel: "AI Agents",
    kicker: "03 · AGENTIC WORKFLOWS",
    title: "Tool-using agents that automate real work.",
    description:
      "Coordinating multi-step tool execution for job research, task planning, and workflow automation without fragile black-box scripts.",
    highlights: ["Tool orchestration", "Job & PMS assistants", "Deterministic guardrails"],
    ctaLabel: "Inspect Agent Repos",
    ctaUrl: "https://github.com/kalyan870/AI-Automation-Agent",
    accentLabel: "Automation",
  },
  {
    id: "slm",
    number: "04",
    shortLabel: "Local SLMs",
    kicker: "04 · LOCAL SMALL LANGUAGE MODELS",
    title: "Offline inference and model benchmarking.",
    description:
      "Running and comparing Qwen, Mistral, Llama, Phi, and Gemma locally via Ollama to measure latency, throughput, and practical deployment tradeoffs.",
    highlights: ["Ollama runtime", "Model benchmarking", "Privacy-first offline AI"],
    ctaLabel: "Open Ollama Lab",
    ctaUrl: "https://local-slm-ollama-lab.vercel.app/",
    accentLabel: "Ollama · JS",
  },
  {
    id: "multimodal",
    number: "05",
    shortLabel: "Multimodal & CV",
    kicker: "05 · MULTIMODAL & COMPUTER VISION",
    title: "Voice, speech, and real-time vision.",
    description:
      "Combining MediaPipe facial emotion telemetry, Hugging Face speech recognition, and interactive captioning APIs into responsive interfaces.",
    highlights: ["MediaPipe landmarks", "Voice-to-LLM flows", "Image caption APIs"],
    ctaLabel: "Inspect Face Emotion",
    ctaUrl: "https://github.com/kalyan870/face-emotion",
    accentLabel: "Vision · Audio",
  },
  {
    id: "fullstack",
    number: "06",
    shortLabel: "Full-Stack Web",
    kicker: "06 · FULL-STACK ENGINEERING",
    title: "From prototype notebook to shipped product.",
    description:
      "Pairing FastAPI, Django REST, PostgreSQL, and Supabase backends with responsive React, Next.js, and TypeScript interfaces packaged cleanly in Docker.",
    highlights: ["React & TypeScript", "FastAPI & Django", "PostgreSQL & Docker"],
    ctaLabel: "Browse All 51+ Repos",
    ctaUrl: "https://github.com/kalyan870?tab=repositories",
    accentLabel: "PyPI & Vercel",
  },
];

export const CURATED_PROJECTS: ProjectItem[] = [
  {
    id: "agentflow-ai",
    repoSlug: "AgentFlow-AI",
    title: "AgentFlow AI",
    category: "AI Agents",
    stack: ["Python", "FastAPI", "LangGraph", "React 19", "Docker"],
    description:
      "Autonomous multi-agent workflow orchestration engine built with LangGraph featuring dynamic task routing, dependency DAG execution, state persistence, and real-time SSE token streaming to a React 19 graph canvas.",
    architectureNote:
      "Integrates multi-provider fallback across OpenAI, Anthropic Claude, and Groq with exponential backoff, human-in-the-loop checkpoints, Pydantic v2 validation, and containerized Docker deployment.",
    repoUrl: "https://github.com/kalyan870/AgentFlow-AI",
    lastUpdated: "Oct 2026",
    featured: true,
  },
  {
    id: "interviewiq-ai",
    repoSlug: "interviewiq-ai",
    title: "InterviewIQ AI",
    category: "Full-Stack",
    stack: ["Python", "FastAPI", "LangChain", "ChromaDB", "Whisper ASR"],
    description:
      "Real-time voice AI interview and evaluation platform featuring resume PDF context injection, role-specific technical question trees, multi-dimensional rubric scoring, and under-800ms turn-taking voice synthesis.",
    architectureNote:
      "Constructs a ChromaDB vector knowledge layer indexing job descriptions and resumes paired with Whisper ASR streaming speech transcription and Streamlit/FastAPI orchestration.",
    repoUrl: "https://github.com/kalyan870/interviewiq-ai",
    lastUpdated: "Aug 2026",
    featured: true,
  },
  {
    id: "local-slm-ollama-lab",
    repoSlug: "local-slm-ollama-lab",
    title: "Local SLM Ollama Lab",
    category: "RAG & LLMs",
    stack: ["JavaScript", "Ollama", "Benchmarking"],
    description:
      "Local small-language-model lab and benchmarking dashboard for experimenting with Ollama and comparing Qwen, Mistral, Llama, Phi, and Gemma across latency and offline workflows.",
    architectureNote:
      "Side-by-side prompt runner and parameter comparison matrix tailored for offline developer workstations.",
    repoUrl: "https://github.com/kalyan870/local-slm-ollama-lab",
    liveUrl: "https://local-slm-ollama-lab.vercel.app/",
    lastUpdated: "2026",
  },
  {
    id: "rag-system",
    repoSlug: "rag-system",
    title: "Enterprise RAG System",
    category: "RAG & LLMs",
    stack: ["Python", "Hybrid Search", "Reranking", "Qdrant"],
    description:
      "Document question-answering system implementing chunking pipelines, hybrid vector-keyword retrieval, cross-encoder reranking, and systematic evaluation metrics.",
    architectureNote:
      "Built for verifiable document grounding with configurable retrieval top-k, reranker thresholds, and trace logging.",
    repoUrl: "https://github.com/kalyan870/rag-system",
    liveUrl: "https://production-rag-application.vercel.app/",
    lastUpdated: "2026",
  },
  {
    id: "realtime-multimodal-app",
    repoSlug: "realtime-multimodal-app",
    title: "Real-Time Multimodal App",
    category: "Multimodal & CV",
    stack: ["FastAPI", "Streamlit", "OpenRouter", "Speech"],
    description:
      "Voice-and-text assistant pairing a Streamlit interface with a FastAPI backend, Hugging Face speech recognition, OpenRouter or NVIDIA LLM APIs, and gTTS speech output.",
    architectureNote:
      "Decoupled FastAPI audio-processing service supporting swappable inference providers and clean containerized deployment.",
    repoUrl: "https://github.com/kalyan870/realtime-multimodal-app",
    liveUrl: "https://saragadamkalyan-realtime-multimodal-frontend.hf.space/",
    lastUpdated: "2026",
  },
  {
    id: "face-emotion",
    repoSlug: "face-emotion",
    title: "Face Emotion Analytics",
    category: "Multimodal & CV",
    stack: ["Python", "MediaPipe", "TypeScript", "Computer Vision"],
    description:
      "Real-time facial emotion recognition and expression telemetry dashboard built with MediaPipe landmarks, OpenCV processing, Python inference, and a TypeScript frontend.",
    architectureNote:
      "Extracts live facial mesh landmarks to classify affective expressions and plot confidence timelines.",
    repoUrl: "https://github.com/kalyan870/face-emotion",
    lastUpdated: "2026",
  },
  {
    id: "django-fetch-guard",
    repoSlug: "django-fetch-guard",
    title: "django-fetch-guard",
    category: "Full-Stack",
    stack: ["Python", "Django 4.2-6.1", "DRF", "PyPI"],
    description:
      "Open-source Python package that prevents accidental Django ORM queries using strict fetch contracts, automatic N+1 query batching, and Django REST Framework integration.",
    architectureNote:
      "Published on PyPI; enforces explicit relation loading contracts in serializers and views to eliminate silent N+1 regressions.",
    repoUrl: "https://github.com/kalyan870/django-fetch-guard",
    liveUrl: "https://pypi.org/project/django-fetch-guard/",
    lastUpdated: "2026",
  },
  {
    id: "customer-feedback-analyzer",
    repoSlug: "Customer-Feedback-Analyzer",
    title: "Customer Feedback Analyzer",
    category: "AI Agents",
    stack: ["Python", "NLP", "Sentiment", "RAG"],
    description:
      "Feedback intelligence pipeline applying NLP, sentiment classification, and RAG synthesis to transform raw customer reviews into prioritized product insights.",
    architectureNote:
      "Clusters recurring themes, flags urgent churn signals, and summarizes evidence-backed action items.",
    repoUrl: "https://github.com/kalyan870/Customer-Feedback-Analyzer",
    lastUpdated: "2026",
  },
  {
    id: "ai-automation-agent",
    repoSlug: "AI-Automation-Agent",
    title: "AI Automation Agent",
    category: "AI Agents",
    stack: ["Python", "Tool Use", "Workflow Agents"],
    description:
      "Autonomous tool-coordinating agent designed to break down multi-step objectives, invoke structured utilities, and automate repetitive developer and research workflows.",
    architectureNote:
      "Implements modular tool schemas, step-by-step execution loops, and clear failure recovery hooks.",
    repoUrl: "https://github.com/kalyan870/AI-Automation-Agent",
    liveUrl: "https://ai-automation-agent-phi.vercel.app/",
    lastUpdated: "2026",
  },
  {
    id: "codebase-knowledge-ai",
    repoSlug: "codebase-knowledge-ai",
    title: "Codebase Knowledge AI",
    category: "RAG & LLMs",
    stack: ["LLM", "Code Retrieval", "Architecture"],
    description:
      "Repository-aware question-answering assistant designed to index software projects, map dependency flow, and accelerate engineering onboarding.",
    architectureNote:
      "Explores AST-aware chunking and semantic file retrieval for answering questions across multi-module repositories.",
    repoUrl: "https://github.com/kalyan870/codebase-knowledge-ai",
    liveUrl: "https://kalyan870.github.io/codebase-knowledge-ai/",
    lastUpdated: "2026",
  },
  {
    id: "kalyanhub",
    repoSlug: "kalyanhub",
    title: "KalyanHub",
    category: "Full-Stack",
    stack: ["React", "Supabase", "Netlify"],
    description:
      "Centralized learning and engineering archive documenting AI projects, technical notes, courses, certifications, and build logs in public.",
    architectureNote:
      "Structured personal knowledge base linking repositories, live experiments, and study milestones.",
    repoUrl: "https://github.com/kalyan870/kalyanhub",
    liveUrl: "https://kalyanhub.netlify.app/",
    lastUpdated: "2026",
  },
];

export const LINKEDIN_EXPERIENCE: ExperienceItem[] = [
  {
    role: "Artificial Intelligence Intern",
    company: "Internship Studio",
    period: "May 2026 – Present",
    type: "Remote Internship",
    desc: "Engineered biometric face recognition using PCA (Eigenfaces, 95% dimensionality reduction) + ANN (96.4% test accuracy), interactive Streamlit inspection dashboard, and 40% latency reduction with NumPy & OpenCV.",
    repoUrl: "https://github.com/kalyan870/FaceRecognition-PCA-ANN",
  },
  {
    role: "Web Developer Intern",
    company: "Codec Technologies India",
    period: "May–Jun 2026",
    type: "Hyderabad, India",
    desc: "Developed modular web components, managed client-side state transitions, collaborated on RESTful API bindings and cross-browser optimizations, and maintained 100% on-time sprint delivery.",
  },
  {
    role: "Full-Stack Web Development Intern",
    company: "Maincrafts",
    period: "2026",
    type: "Internship",
    desc: "Shipped responsive landing pages and multi-page full-stack web deliverables with semantic markup and interactive UI components.",
    repoUrl: "https://github.com/kalyan870/maincrafts-site",
  },
];

export const LINKEDIN_POSTS: LinkedInPostItem[] = [
  {
    id: "li-genai-workshop",
    type: "LEARNING UPDATE",
    title: "Generative AI Workshop completed",
    excerpt:
      "A milestone in my AI Engineering journey — strengthening practical workflows across Generative AI, LLMs, AI Agents, and full-stack AI applications.",
    date: "Jul 2026",
    readTime: "3 min read",
    tags: ["Generative AI", "LLMs", "AI Engineering"],
    url: "https://www.linkedin.com/in/saragadamkalyan/recent-activity/all/",
  },
  {
    id: "li-gcp-genai",
    type: "CERTIFICATION",
    title: "Google Cloud Gen AI Academy APAC — Cohort 2",
    excerpt:
      "Hands-on exposure to real-world AI solution development, data analytics, intelligent systems, and Google Cloud infrastructure.",
    date: "Jun 2026",
    readTime: "4 min read",
    tags: ["Google Cloud", "Gen AI", "Hack2skill"],
    url: "https://www.linkedin.com/in/saragadamkalyan/recent-activity/all/",
  },
  {
    id: "li-ai-internship",
    type: "INTERNSHIP RETROSPECTIVE",
    title: "What I learned from AI internship work",
    excerpt:
      "Face recognition with PCA and ANN, Streamlit prototyping, data preprocessing, and the practical engineering habits behind reliable ML applications.",
    date: "Jun 2026",
    readTime: "5 min read",
    tags: ["Internship", "Computer Vision", "Python"],
    url: "https://www.linkedin.com/in/saragadamkalyan/recent-activity/all/",
  },
  {
    id: "li-build-in-public",
    type: "BUILD IN PUBLIC",
    title: "Why I share every prototype on GitHub & LinkedIn",
    excerpt:
      "Turning class concepts and experiments into inspectable repositories — from hybrid RAG search and local Ollama benchmarks to N+1 query guards on PyPI.",
    date: "May 2026",
    readTime: "4 min read",
    tags: ["Open Source", "Build in Public", "Career"],
    url: "https://www.linkedin.com/in/saragadamkalyan/recent-activity/all/",
  },
];

export const VERIFIED_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-crio-fullstack-ai",
    title: "Certified Full-Stack & Applied AI Developer",
    issuer: "Crio.Do",
    date: "Nov 2026",
    code: "CRIO.DO / 2026",
    category: "AI & Cloud",
    url: "https://www.crio.do/",
  },
  {
    id: "cert-databricks",
    title: "Databricks Accredited Generative AI Fundamentals",
    issuer: "Databricks",
    date: "Oct 2026",
    code: "DATABRICKS / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1XY-rb24OZRL6a5N1jdPKNsp_FUeXTYIR/view?usp=sharing",
  },
  {
    id: "cert-aws-claude",
    title: "Fundamentals of Prompt Engineering with Claude",
    issuer: "Amazon Web Services (AWS)",
    date: "Mar 2026",
    code: "AWS / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1hhMZx5XdCAviU_fF0R9sPwN_6G_lKIZT/view?usp=sharing",
  },
  {
    id: "cert-anthropic-claude101",
    title: "Claude 101",
    issuer: "Anthropic",
    date: "Apr 2026",
    code: "CLAUDE 101 / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1FHWuwwUM8QmvwS6w9W6MROI9Kd5lU-vK/view?usp=drivesdk",
  },
  {
    id: "cert-gcp-genai",
    title: "Google Cloud Gen AI Academy APAC — Cohort 2",
    issuer: "Hack2skill · Google Cloud",
    date: "Jun 2026",
    code: "HACK2SKILL / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1Bbm1aZMJcL-8mmFuPiZFv8rXR6X7Qln1/view?usp=sharing",
  },
  {
    id: "cert-tata-forage",
    title: "Tata — GenAI Powered Data Analytics Job Simulation",
    issuer: "Forage",
    date: "Apr 2026",
    code: "KxJZsEhbvsC9diJMj",
    category: "Simulations",
    url: "https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_693697c55e7415c2462ac0dd_1777138051289_completion_certificate.pdf",
  },
  {
    id: "cert-deloitte-forage",
    title: "Deloitte Technology Job Simulation",
    issuer: "Forage",
    date: "Apr 2026",
    code: "DELOITTE / 2026",
    category: "Simulations",
    url: "https://drive.google.com/file/d/1jJe0vDamZrnRlHlW0zdgaDA6LKRhRMxk/view?usp=drivesdk",
  },
  {
    id: "cert-guvi-fullstack",
    title: "GUVI x HCL Full Stack Development Workshop 2026",
    issuer: "HCL GUVI",
    date: "May 2026",
    code: "GUVI / HCL / 2026",
    category: "Full-Stack & Data",
    url: "https://drive.google.com/file/d/18aDkbo6LT6y6qtGO_IFM0F_Ta2Vu4QPR/view?usp=sharing",
  },
  {
    id: "cert-guvi-solidworks",
    title: "SolidWorks Masterclass",
    issuer: "HCL GUVI",
    date: "May 2026",
    code: "6j77W3iv7H139741nR",
    category: "Full-Stack & Data",
    url: "https://www.guvi.in/share-certificate/6j77W3iv7H139741nR",
  },
  {
    id: "cert-freeacademy-prompt",
    title: "Prompt Engineering",
    issuer: "FreeAcademy.ai",
    date: "Aug 2026",
    code: "FREEACADEMY / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1Yux5otqBL-NfW7iSIOaT8_GkL0ae0b-3/view?usp=sharing",
  },
  {
    id: "cert-growthschool",
    title: "Generative AI Workshop",
    issuer: "GrowthSchool",
    date: "Jul 2026",
    code: "GROWTHSCHOOL / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/10lIuFuwXhFcnrgYBdKcEZki5rB2LfSWh/view?usp=sharing",
  },
  {
    id: "cert-aincat",
    title: "AINCAT 2026 — Certificate of Participation",
    issuer: "Naukri Campus",
    date: "Jun 2026",
    code: "AINCAT / 2026",
    category: "Full-Stack & Data",
    url: "https://drive.google.com/file/d/1Fm8ZuhLqrVrsNTu4CICfgAC0UXx16hY9/view?usp=drivesdk",
  },
  {
    id: "cert-freedom-ai",
    title: "AI Masterclass",
    issuer: "Freedom With AI",
    date: "Apr 2026",
    code: "AI MASTERCLASS / 2026",
    category: "AI & Cloud",
    url: "https://drive.google.com/file/d/1D5N83OcCowYj0BwTt3RWjFwKpxiiLrwO/view?usp=drivesdk",
  },
];

export const VAULT_EXPERIMENTS = [
  {
    num: "01",
    tag: "INTERACTIVE EXPLAINER",
    title: "How LLM Works",
    description:
      "Interactive visual platform breaking down tokenization, attention workflows, and prompt processing.",
    cta: "Launch Explainer",
    url: "https://llm-explainer-three.vercel.app/",
  },
  {
    num: "02",
    tag: "OFFLINE AI LAB",
    title: "Local SLM Ollama Lab",
    description:
      "Benchmark and compare Qwen, Mistral, Llama, Phi, and Gemma locally without cloud API lock-in.",
    cta: "Open Ollama Lab",
    url: "https://local-slm-ollama-lab.vercel.app/",
  },
  {
    num: "03",
    tag: "PRODUCTION RAG",
    title: "Production RAG App",
    description:
      "Live hybrid-search document Q&A interface with reranking and grounded source citations.",
    cta: "Open RAG Demo",
    url: "https://production-rag-application.vercel.app/",
  },
  {
    num: "04",
    tag: "LEARNING ARCHIVE",
    title: "KalyanHub Portal",
    description:
      "Public engineering notebook tracking courses, certifications, architecture notes, and build milestones.",
    cta: "Visit KalyanHub",
    url: "https://kalyanhub.netlify.app/",
  },
];

export const FALLBACK_SUBSTACK_POSTS: SubstackPost[] = [
  {
    id: "how-llm-works",
    title: "HOW LLM WORKS",
    link: "https://saragadamkalyan.substack.com/p/how-llm-works",
    pubDate: "Thu, 14 May 2026 17:39:10 GMT",
    formattedDate: "May 14, 2026",
    author: "Saragadam Kalyan",
    summary:
      "Developed an Interactive LLM Explainer Platform using modern AI-assisted development workflows to simplify and visualize how Large Language Models work through an engaging and user-friendly interface.",
    coverImage: null,
    readTimeMinutes: 2,
    tags: ["AI", "LLM", "GenerativeAI", "ReactJS", "WebDevelopment"],
    contentHtml: `
      <p>Developed an Interactive LLM Explainer Platform using modern AI-assisted development workflows to simplify and visualize how Large Language Models work through an engaging and user-friendly interface.</p>
      <p>The application demonstrates core AI concepts, LLM workflows, prompt processing, and modern AI system architecture with responsive UI design and interactive learning components.</p>
      <h3>Tech Stack</h3>
      <p>React, Tailwind CSS, JavaScript, Vercel</p>
      <h3>Live Demo</h3>
      <p><a href="https://llm-explainer-three.vercel.app/" target="_blank" rel="noopener noreferrer">https://llm-explainer-three.vercel.app/</a></p>
    `,
  },
];

export const FEATURED_ECOSYSTEMS = [
  "Crio.Do",
  "PyPI Open Source",
  "Hugging Face Spaces",
  "Google Cloud Gen AI Academy",
  "Databricks",
  "Amazon Web Services",
  "Anthropic",
  "Forage · Tata & Deloitte",
  "HCL GUVI",
  "Internship Studio",
  "Codec Technologies India",
  "GitHub",
  "Substack",
];

export interface RecognitionItem {
  id: string;
  tag: string;
  title: string;
  organization: string;
  summary: string;
  linkLabel: string;
  url: string;
}

export const RECOGNITION_HIGHLIGHTS: RecognitionItem[] = [
  {
    id: "rec-pypi",
    tag: "OPEN SOURCE PACKAGE",
    title: "Published django-fetch-guard on PyPI",
    organization: "Python Package Index · Django 4.2–6.1",
    summary:
      "Released an open-source ORM guard library that enforces strict fetch contracts and automatic N+1 query batching for Django and Django REST Framework teams.",
    linkLabel: "View on PyPI",
    url: "https://pypi.org/project/django-fetch-guard/",
  },
  {
    id: "rec-gcp-cohort",
    tag: "COHORT SELECTION",
    title: "Google Cloud Gen AI Academy APAC — Cohort 2",
    organization: "Hack2skill & Google Cloud · Jun 2026",
    summary:
      "Completed Cohort 2 training focused on production Generative AI workflows, cloud analytics, and scalable intelligent applications.",
    linkLabel: "Verify Credential",
    url: "https://drive.google.com/file/d/1Bbm1aZMJcL-8mmFuPiZFv8rXR6X7Qln1/view?usp=sharing",
  },
  {
    id: "rec-internships",
    tag: "INDUSTRY INTERNSHIPS",
    title: "AI & Web Engineering Internships",
    organization: "Internship Studio · Codec Technologies · Maincrafts",
    summary:
      "Delivered PCA + ANN facial recognition pipelines in Python/Streamlit and modular REST-bound web interfaces across three 2026 engineering internships.",
    linkLabel: "View LinkedIn Featured",
    url: "https://www.linkedin.com/in/saragadamkalyan/details/featured/",
  },
  {
    id: "rec-hf-demos",
    tag: "COMMUNITY SHOWCASE",
    title: "Live Multimodal & RAG Deployments",
    organization: "Hugging Face Spaces · Vercel · Netlify",
    summary:
      "Shipped public interactive demos—including Real-Time Multimodal AI, Local SLM Ollama Lab, and Production RAG Search—open for peer testing and code inspection.",
    linkLabel: "Explore Hugging Face Space",
    url: "https://saragadamkalyan-realtime-multimodal-frontend.hf.space/",
  },
];

export interface ResumeSkillGroup {
  category: string;
  items: string[];
}

export interface ResumeExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface ResumeProjectItem {
  title: string;
  subtitle: string;
  period: string;
  stack: string;
  repoLabel: string;
  repoUrl: string;
  bullets: string[];
}

export interface ResumeCertificationItem {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export const RESUME_DATA = {
  fileName: "Saragadam_Kalyan_AI_Engineer_Resume.pdf",
  pdfUrl: "/assets/aistudio/Saragadam_Kalyan_AI_Engineer_Resume_405ec93d.pdf",
  summary:
    "AI Engineer & Full-Stack Developer specializing in agentic AI workflows, LLM orchestration, and RAG systems. Hands-on experience building autonomous multi-agent graphs with LangGraph, hybrid vector & BM25 retrieval engines, and low-latency multimodal voice streaming. Skilled at deploying production-ready automation pipelines using FastAPI, React 19, Docker, and CI/CD practices. Crio.Do Certified Full-Stack & Applied AI Developer.",
  skills: [
    {
      category: "Languages",
      items: ["Python", "JavaScript", "TypeScript", "SQL"],
    },
    {
      category: "AI / ML & Automation",
      items: [
        "LLMs",
        "Generative AI",
        "Agentic AI",
        "LangChain",
        "LangGraph",
        "Multi-Agent Systems",
        "RAG",
        "Vector DBs (ChromaDB)",
        "Scikit-learn",
        "OpenCV",
        "Neural Networks (ANN)",
        "PCA",
        "Whisper ASR",
        "MLOps",
        "n8n",
      ],
    },
    {
      category: "Cloud & DevOps",
      items: [
        "Docker",
        "Git & GitHub Actions (CI/CD)",
        "REST APIs",
        "WebSockets",
        "Linux",
        "Microservices",
      ],
    },
    {
      category: "Tools & Frameworks",
      items: [
        "FastAPI",
        "React 19",
        "Next.js",
        "Tailwind CSS",
        "Streamlit",
        "Visual Studio Code",
        "Claude",
        "Google AI Studio",
        "Antigravity",
      ],
    },
  ] as ResumeSkillGroup[],
  experience: [
    {
      role: "Artificial Intelligence Intern",
      company: "Internship Studio",
      period: "May 2026 – Present",
      location: "Remote",
      bullets: [
        "Engineered biometric face recognition system using PCA (Eigenfaces) for 95% dimensionality reduction with ANN classifier (96.4% test accuracy).",
        "Built and deployed interactive Streamlit inspection dashboard with real-time eigenvector visualization and biometric landmark tracking.",
        "Optimized image preprocessing and feature extraction pipelines with NumPy and OpenCV, reducing inference latency by 40%.",
      ],
    },
    {
      role: "Web Developer Intern",
      company: "Codec Technologies India",
      period: "May 2026 – Jun 2026",
      location: "Hyderabad, Telangana, India",
      bullets: [
        "Developed modular, high-performance web components and managed client-side state transitions using JavaScript, HTML5, and CSS3.",
        "Collaborated on RESTful API data bindings, responsive layouts, and cross-browser performance optimizations under lead mentorship.",
        "Maintained 100% on-time sprint task completion and streamlined version control workflows using Git and GitHub.",
      ],
    },
  ] as ResumeExperienceItem[],
  projects: [
    {
      title: "AgentFlow AI",
      subtitle: "Autonomous Multi-Agent Workflow Engine",
      period: "Aug 2026 – Oct 2026",
      stack: "Python, FastAPI, LangGraph, LangChain, React 19, TypeScript, Tailwind CSS, Docker",
      repoLabel: "GitHub: AgentFlow-AI",
      repoUrl: "https://github.com/kalyan870/AgentFlow-AI",
      bullets: [
        "Built autonomous multi-agent orchestration engine in LangGraph with dynamic task routing, dependency DAG execution, and state persistence.",
        "Integrated multi-provider fallback across OpenAI, Anthropic Claude, and Groq with exponential backoff and human-in-the-loop checkpoints.",
        "Engineered real-time SSE token streaming to a React 19 + TypeScript graph canvas with live agent execution tracing and replay.",
        "Structured with layered clean architecture (Pydantic v2 validation, structured logging, safe exception handling) and containerized with Docker.",
      ],
    },
    {
      title: "InterviewIQ AI",
      subtitle: "Real-Time Voice AI Interview & Evaluation Platform",
      period: "Jun 2026 – Aug 2026",
      stack: "Python, FastAPI, Streamlit, LangChain, ChromaDB, Whisper ASR, PyPDF",
      repoLabel: "GitHub: interviewiq-ai",
      repoUrl: "https://github.com/kalyan870/interviewiq-ai",
      bullets: [
        "Built adaptive voice-driven interview platform featuring resume PDF context injection and role-specific technical question trees.",
        "Engineered multi-dimensional rubric engine evaluating technical accuracy, trade-off depth, and communication clarity with instant feedback.",
        "Integrated real-time speech transcription (Whisper ASR) and streaming voice synthesis, reducing turn-taking latency to under 800ms.",
        "Constructed vector search knowledge layer (ChromaDB) indexing job descriptions and candidate resumes for targeted follow-up probing.",
      ],
    },
  ] as ResumeProjectItem[],
  certifications: [
    {
      title: "Certified Full-Stack & Applied AI Developer",
      issuer: "Crio.Do",
      date: "Nov 2026",
      description:
        "Validates real-world software engineering, REST API backend architecture, and production-grade applied AI and full-stack systems.",
    },
    {
      title: "Databricks Accredited Generative AI Fundamentals",
      issuer: "Databricks",
      date: "Oct 2026",
      description:
        "Validates core proficiency in LLMs, enterprise RAG architectures, evaluation metrics, and generative AI deployments.",
    },
  ] as ResumeCertificationItem[],
  achievements: [
    "Authored and published 50+ open-source AI, ML, and web repositories on GitHub with verified CI workflows and interactive demos.",
    "Earned Crio.Do Full-Stack Verified Accreditation for production-quality full-stack engineering and multi-service software delivery.",
    "Completed AI Internship at Internship Studio with 96.4% test accuracy on biometric eigenface dimensional classification.",
  ],
  education: {
    degree: "Bachelor of Technology (B.Tech) — Computer Science & Engineering",
    institution: "Vignan's Institute of Information Technology",
    cgpa: "CGPA: 8.5 / 10.0 (In Progress)",
    period: "Jul 2024 – Apr 2028",
    location: "Visakhapatnam, Andhra Pradesh, India",
  },
};


