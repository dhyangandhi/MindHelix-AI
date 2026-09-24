🧬 MindHelix AI — System Architecture & Blueprint
Document Version: 2.0.0 (Production Blueprint)
> Last Updated: September 2026
> Target Platforms: Web (Vercel / Node.js), Mobile (Capacitor Android), Desktop (Electron), Edge (Cloudflare Workers)
> Status: Fully Integrated & Active
> Reference File: ARCHITECTURE.md

---

## 📐 1. System Overview

MindHelix AI is an intelligent, multi-platform AI automation, conversational reasoning, and generative image synthesis suite. Engineered with a glassmorphic dark-mode interface, a high-performance Express 5 backend gateway, and a zero-plaintext data protection architecture, the platform delivers a seamless, synchronized experience across Web browsers, Android mobile devices, Windows desktop systems, and serverless edge networks.

### Core Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, Vanilla JavaScript | Responsive glassmorphism interface, custom routing |
| **Icons & Fonts** | FontAwesome 6, Boxicons, Google Fonts | Outfit & Plus Jakarta Sans typography |
| **Backend Runtime** | Node.js (v20+), Express.js (v5) | RESTful API server, static file server |
| **Security & Auth** | Bcrypt, UUID, Base64URL | Password hashing, session IDs, URL obfuscation |
| **AI Integration** | OpenRouter API Gateway | Multi-model neural engine integration |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational data persistence & migrations |
| **Email Service** | Nodemailer (SMTP) | Password reset & user verification dispatch |
| **Mobile Engine** | Capacitor (@capacitor/android) | Web-to-native Android app wrapper |
| **Desktop Engine** | Electron | Desktop executable application wrapper |

---

flowchart TB
    %% Presentation Tier
    subgraph Clients["📱 Client Presentation Tier"]
        Web["🌐 Web Browser (Responsive Glassmorphism)"]
        Mobile["📱 Native Android App (Capacitor Engine)"]
        Desktop["💻 Native Desktop App (Electron Engine)"]
    end

    %% Edge Ingress
    subgraph Edge["☁️ Edge Gateway & Static Distribution"]
        CFWorker["Cloudflare Worker (worker.js)"]
        VercelEdge["Vercel Serverless Gateway (api/index.js)"]
        StaticCDN["Static Asset Server (/www, Clean URLs)"]
    end

    %% Security & Routing
    subgraph Security["🛡️ Security & Routing Middleware"]
        URLResolver["Route Resolver & Token Decryptor (/e/:token, /secure)"]
        CryptoUtil["AES-256-CBC & SHA-256 Engine (utils/encryption.js)"]
        AuthShield["Bcrypt & Session Guard"]
    end

    %% Core Application Server
    subgraph CoreBackend["⚙️ Core Backend Engine (server.js - Express 5)"]
        AuthRouter["Auth Controller (/api/register, /api/login)"]
        PasswordRecovery["Password Reset Controller (/forgot-password, /reset-password)"]
        AIChatProxy["AI Chat Service (/chat - Model Fallback Cascade)"]
        ImageGenService["AI Image Synthesis (/api/generate-image)"]
        DataMasking["Neon Data Masking Service (/api/neon-masking)"]
    end

    %% Persistence & External Services
    subgraph Persistence["🗄️ Persistence & External Cloud Services"]
        NeonDB[("🐘 Neon Serverless PostgreSQL\n(users2 table: Encrypted PII & Hashes)")]
        OpenRouter["🧠 OpenRouter AI Gateway\n(Liquid LFM / Nex N2.5 / GLM / Gemma)"]
        FluxEngine["🎨 FLUX.1 & SDXL Synthesis Engine\n(Image Generation)"]
        SMTPMail["✉️ Nodemailer SMTP Service\n(Gmail Automated Transporter)"]
    end

    %% Client Connections
    Web --> VercelEdge & StaticCDN
    Mobile --> StaticCDN
    Desktop --> StaticCDN
    VercelEdge --> URLResolver
    CFWorker --> URLResolver
    StaticCDN --> URLResolver

    %% Middleware Connections
    URLResolver --> CryptoUtil
    URLResolver --> CoreBackend
    AuthShield --> CoreBackend

    %% Backend Services to External
    AuthRouter --> CryptoUtil
    AuthRouter --> NeonDB
    PasswordRecovery --> NeonDB
    PasswordRecovery --> SMTPMail
    DataMasking --> NeonDB
    DataMasking --> CryptoUtil

    AIChatProxy --> OpenRouter
    ImageGenService --> OpenRouter
    ImageGenService --> FluxEngine


---

## 📁 3. Repository File & Folder Hierarchy

---

├── ARCHITECTURE.md            # System Architecture & Blueprint Document
├── README.md                  # Project Quickstart & Overview Document
├── server.js                  # Main Express 5 Backend Server & API Routes
├── worker.js                  # Cloudflare Edge Worker Runtime (Neon Serverless Driver)
├── main.js                    # Electron Native Desktop Application Wrapper
├── package.json               # Node.js Dependencies, Engines & Execution Scripts
├── capacitor.config.json      # Capacitor Mobile Engine Configuration
├── vercel.json                # Vercel Serverless Deployment Configuration
├── wrangler.toml              # Cloudflare Workers Deployment Configuration
├── .env                       # Environment Secrets & Connection Strings
├── api/
│   └── index.js               # Vercel Serverless Entrypoint (Exports server.js)
├── utils/
│   └── encryption.js          # AES-256-CBC, SHA-256 Hashing & PII Data Masking Routines
├── prisma/
│   ├── schema.prisma          # Prisma Relational Database Schema
│   └── prisma.config.ts       # Prisma Client Configuration
├── android/                   # Native Android Studio Project Source Code
├── dashbord.html              # Glassmorphic User Dashboard View
├── Contact.html               # Contact Form Interface
└── www/                       # Core Web Application Assets
    ├── index.html             # Primary MindHelix AI Landing Page
    ├── home.html              # Secondary Landing Page Mirror
    ├── ai.html                # MindHelix Interactive AI Assistant & Image Studio
    ├── login.html             # Secure User Login Interface
    ├── register.html          # Secure User Registration Interface
    ├── forgot-password.html   # Password Recovery Entry View
    ├── reset-password.html    # Password Reset Submission View
    ├── forget succefull.html  # Recovery Email Sent Confirmation View
    ├── components.html        # Glassmorphic UI Components Showcase
    ├── form.js                # Auth Form Client-side Validation & API Dispatch
    ├── url-encryptor.js       # Client-side Route Token Obfuscation Engine
    ├── home.css               # Landing Page Stylesheet
    ├── ai.css                 # AI Chat & Studio Stylesheet
    ├── Dashbord.css           # Dashboard Component Stylesheet
    ├── Contact.css            # Contact Form Stylesheet
    ├── style.css / 2style.css # Authentication Form Stylesheets
    └── shadcn.css / shadcn.js # Modern UI Component Utilities

```

## 🔄 4. Key Sequence & Workflow Diagrams

### A. User Authentication & Encrypted Navigation

```mermaid
flowchart TD
    A["User submits Login Form (login.html)"] --> B["form.js validates inputs"]
    B --> C["url-encryptor.js encrypts target token"]
    C --> D["POST Request to Express API /api/login"]
    D --> E{"Check Email in PostgreSQL"}
    E -- "Not Found" --> F["Return Error: Invalid Credentials"]
    E -- "Found" --> G{"Compare Bcrypt Password Hash"}
    G -- "Mismatch" --> F
    G -- "Match" --> H["Generate Session Token"]
    H --> I["Return Session Token & Encrypted Path"]
    I --> J["Redirect User to Dashboard / AI Hub (ai.html)"]
```

### B. MindHelix AI Chat Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant ChatUI as ai.html (MindHelix Assistant)
    participant Server as server.js (Express Gateway)
    participant OpenRouter as OpenRouter AI API Cloud

    User->>ChatUI: Input prompt and click "Send"
    ChatUI->>ChatUI: Append User Message to UI Log
    ChatUI->>Server: HTTP POST /api/chat { prompt, history, model }
    Server->>Server: Inject Server API Key & Validate Payload
    Server->>OpenRouter: POST https://openrouter.ai/api/v1/chat/completions
    OpenRouter-->>Server: Return Model Response Payload
    Server-->>ChatUI: HTTP 200 OK (Response Payload)
    ChatUI->>ChatUI: Render Response (Markdown & Code Highlighting)
    ChatUI-->>User: Display AI Response with Interactive Actions
```

---

## 🚀 5. Cross-Platform Compilation Pipeline

```mermaid
flowchart LR
    subgraph Source["💻 Core Web Application"]
        HTML_CSS_JS["www/ Directory\n(HTML5, CSS3, JS)"]
        API["Node.js / Express 5 API\n(server.js, utils/encryption.js)"]
    end

    subgraph Web["🌐 Web Target"]
        NodeServer["Node.js + Express\n(Hosted Server / Vercel Serverless)"]
    end

    subgraph Mobile["📱 Mobile Target"]
        CapacitorCLI["Capacitor Sync\n(npx cap sync android)"]
        AndroidBuild["Android Gradle Build"]
        APK_Bundle["Native APK / AAB"]
    end

    subgraph Desktop["💻 Desktop Target"]
        ElectronBuild["Electron Engine (main.js)\n(npm run electron)"]
        ExeBundle["Windows .exe"]
    end

    subgraph Edge["⚡ Edge Target"]
        CFWorker["Cloudflare Worker\n(worker.js)"]
    end

    HTML_CSS_JS --> NodeServer
    API --> NodeServer
    
    HTML_CSS_JS --> CapacitorCLI --> AndroidBuild --> APK_Bundle
    HTML_CSS_JS --> ElectronBuild --> ExeBundle
    HTML_CSS_JS --> CFWorker
```

---

## ⚙️ 6. Deployment & Environment Setup

### Environment Configuration (`.env`)
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/mindhelix_db?schema=public"
ENCRYPTION_KEY="your-super-secret-32-byte-master-encryption-key"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="liquid/lfm-2.5-2.6b:free"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-google-app-password"
```

Execution Commands
Run Server (Development): npm run dev
Run Server (Production): npm start
Run Desktop App (Electron): npm run electron
Sync Mobile Android Assets (Capacitor): npx cap sync android
