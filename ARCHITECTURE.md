    # 🧬 MindHelix AI — System Architecture & Blueprint

> **Document Version:** 1.0.0  
> **Last Updated:** July 31, 2026  
> **Project Target:** Web Application, Mobile (Android), Desktop (Electron)

---

## 📐 1. System Overview

**MindHelix AI** is an intelligent, multi-platform AI automation and conversational suite. It features a glassmorphic frontend UI, a secure Express 5 backend gateway, a PostgreSQL database managed via Prisma ORM, and cross-platform native compilation targets via Capacitor (Android) and Electron (Desktop).

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

## 🏛️ 2. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["📱 Client Targets"]
        WebBrowser["🌐 Web Browser (Desktop / Mobile)"]
        MobileApp["📱 Native Android App (Capacitor)"]
        DesktopApp["💻 Desktop App (Electron)"]
    end

    subgraph Frontend["🎨 Presentation Layer (www/)"]
        LandingPage["index.html / home.html\n(Landing Page & Hero UI)"]
        AIAssistant["ai.html\n(MindHelix AI Chat Hub)"]
        AuthPages["login.html / register.html\n(Auth Entry Points)"]
        URLEncryptor["url-encryptor.js\n(Base64URL Token Encryptor)"]
    end

    subgraph Backend["⚙️ Backend Layer (server.js)"]
        ExpressServer["Express.js Server (v5)\n(Port 3000 / 5000)"]
        AuthModule["Auth & Security Router\n(Bcrypt / JWT / Nodemailer)"]
        AIGateway["OpenRouter AI Proxy\n(Model Gateway)"]
    end

    subgraph Infrastructure["🗄️ Database & External Services"]
        PostgreSQL[("🐘 PostgreSQL Database")]
        PrismaORM["Prisma ORM (@prisma/client)"]
        OpenRouterAPI["🧠 OpenRouter AI API\n(DeepSeek / Gemini / Claude)"]
        SMTPServer["✉️ SMTP Email Server\n(Nodemailer)"]
    end

    %% Connections
    WebBrowser --> LandingPage
    MobileApp --> LandingPage
    DesktopApp --> LandingPage

    LandingPage --> AuthPages
    LandingPage --> AIAssistant
    AuthPages --> URLEncryptor

    AuthPages -- "REST API: /api/register, /api/login" --> AuthModule
    AIAssistant -- "REST API: /api/chat" --> AIGateway
    LandingPage -- "Static Assets" --> ExpressServer

    AuthModule --> PrismaORM
    PrismaORM --> PostgreSQL
    AuthModule -- "Send Reset Emails" --> SMTPServer
    AIGateway -- "Forward Chat Prompts" --> OpenRouterAPI
```

---

## 📁 3. Repository File & Folder Hierarchy

```
c:\Users\Admin\Pictures\html pages\
├── ARCHITECTURE.md            # System Architecture & Blueprint Document
├── server.js                  # Main Express Backend Server & API Routes
├── package.json               # Node Dependencies & Build Scripts
├── capacitor.config.json      # Capacitor Mobile Configuration
├── .env                       # Environment Variables & API Secrets
├── prisma/
│   ├── schema.prisma          # Database Schemas & Models
│   └── prisma.config.ts       # Prisma Client Configuration
├── android/                   # Native Android Studio Project Source
└── www/                       # Frontend Web Files & Assets
    ├── index.html             # Main MindHelix AI Landing Page
    ├── home.html              # Secondary Landing Page Mirror
    ├── ai.html                # MindHelix Interactive AI Assistant
    ├── login.html             # User Login Interface
    ├── register.html          # User Registration Interface
    ├── forgot-password.html   # Password Recovery Page
    ├── reset-password.html    # Password Reset Entry Page
    ├── dashbord.html          # User Dashboard View
    ├── home.css               # Main Landing Page Stylesheet
    ├── style.css              # Login/Register Form Stylesheet
    ├── 2style.css             # Registration Component Stylesheet
    ├── form.js                # Auth Form Validation & API Call Handler
    ├── url-encryptor.js       # Encrypted URL Token Generator
    ├── logo.svg               # MindHelix Brand Logo Asset
    └── profile.png            # User Avatar Fallback Asset
```

---

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
    end

    subgraph Web["🌐 Web Target"]
        NodeServer["Node.js + Express\n(Hosted Server)"]
    end

    subgraph Mobile["📱 Mobile Target"]
        CapacitorCLI["Capacitor Sync\n(npx cap sync)"]
        AndroidBuild["Android Gradle Build"]
        APK_Bundle["Native APK / AAB"]
    end

    subgraph Desktop["💻 Desktop Target"]
        ElectronBuild["Electron Engine"]
        ExeBundle["Windows .exe"]
    end

    HTML_CSS_JS --> NodeServer
    HTML_CSS_JS --> CapacitorCLI --> AndroidBuild --> APK_Bundle
    HTML_CSS_JS --> ElectronBuild --> ExeBundle
```

---

## ⚙️ 6. Deployment & Environment Setup

### Environment Configuration (`.env`)
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/mindhelix_db?schema=public"
OPENROUTER_API_KEY="your_openrouter_api_key"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
```

### Execution Commands
* **Run Server (Development)**: `npm run dev`
* **Run Server (Production)**: `npm start`
* **Run Desktop App (Electron)**: `npm run electron`
* **Sync Mobile Build (Capacitor)**: `npx cap sync android`
