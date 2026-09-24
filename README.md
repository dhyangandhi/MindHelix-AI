# 🧬 MindHelix AI — System Architecture & Blueprint

> **Document Version:** 2.0.0 (Production Blueprint)  
> **Last Updated:** September 2026  
> **Target Platforms:** Web (Vercel / Node.js), Mobile (Capacitor Android), Desktop (Electron), Edge (Cloudflare Workers)  
> **Status:** Fully Integrated & Active  
> **Core Architecture Blueprint:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📐 1. System Overview

**MindHelix AI** is an intelligent, multi-platform AI automation, conversational reasoning, and generative image synthesis suite. Engineered with a **glassmorphic dark-mode interface**, a high-performance **Express 5 backend gateway**, and a **zero-plaintext data protection architecture**, the platform delivers a seamless, synchronized experience across **Web browsers**, **Android mobile devices**, **Windows desktop systems**, and **serverless edge networks**.

### Core Technology Stack Matrix

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3 Glassmorphism, Vanilla JS | Modern responsive dark mode interface, custom clean URL routing in `www/` |
| **Icons & Typography** | FontAwesome 6, Boxicons, Google Fonts | Outfit & Plus Jakarta Sans typography |
| **Backend Runtime** | Node.js (v20+), Express.js (v5.2.1) | Non-blocking asynchronous REST API gateway & static file server in `server.js` |
| **Edge Serverless** | Cloudflare Workers (V8), Vercel Serverless | Low-latency edge distribution and API proxying via `worker.js` and `api/index.js` |
| **Security & Auth** | AES-256-CBC, Bcrypt, SHA-256, UUID v4 | Zero-plaintext field encryption, blind email indexing, password salt-hashing in `utils/encryption.js` |
| **URL Security** | Base64URL, AES Route Tokens | Dynamic URL obfuscation (`/e/:token` and `/secure?token=...`) in `www/url-encryptor.js` |
| **AI Conversational Hub** | OpenRouter Multi-Model Gateway | Automated 4-tier model fallback cascade: Liquid LFM $\rightarrow$ Nex N2.5 Pro $\rightarrow$ GLM 5.2 $\rightarrow$ Gemma |
| **AI Image Engine** | FLUX.1 Schnell, SDXL, Pollinations AI | Prompt styler, seed control, artistic presets, and high-resolution rendering |
| **Database & ORM** | Neon Serverless PostgreSQL, Prisma ORM | Relational persistence, connection pooling (`pg.Pool`), SSL encryption |
| **Email Service** | Nodemailer (SMTP), Gmail API | Automated password recovery dispatch with 15-minute expiring tokens |
| **Mobile Runtime** | `@capacitor/android` (v8.3.3) | Web-to-native Android Studio compilation wrapper (`capacitor.config.json`) |
| **Desktop Runtime** | Electron (v42.0.1) | Native Windows executable wrapper with Chromium runtime in `main.js` |

---

## 🏷️ 2. Architectural Symbols & Legend Key

| Symbol Shape | Mermaid Syntax | Architectural Meaning | Example in MindHelix AI |
| :---: | :--- | :--- | :--- |
| `[ Rectangle ]` | `[Label]` | **Component / Microservice / Process** | Express Controller, Token Generator |
| `([ Stadium / Pill ])` | `([Label])` | **System Start / End / Endpoint** | User Action, API HTTP Response |
| `[(" Cylinder ")]` | `[("Label")]` | **Database / Data Persistence Store** | Neon Serverless PostgreSQL (`users2`) |
| `{" Diamond "}` | `{"Label"}` | **Decision Gate / Conditional Logic** | Password Match?, Model Available? |
| `[[ Subroutine ]]` | `[[Label]]` | **Encapsulated Security Routine** | AES-256-CBC Encrypt, SHA-256 Hash |
| `(( Circle ))` | `((Label))` | **State / Connector Point** | Session State, Memory Buffer |
| `subgraph ... end` | `subgraph Tier` | **Logical Isolation Boundary / Tier** | Presentation, Security, Persistence |
| `──>` | `-->` | **Standard HTTP / REST Request Flow** | Client to Server HTTP POST |
| `══>` | `==>` | **Primary Secure Data Stream** | Encrypted Payload to DB |
| `-.->` | `-.->` | **Asynchronous Fallback / Error Recovery** | AI Multi-Model Cascading |

---

## 🏛️ 3. Master System Architecture Diagram

```mermaid
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
```

---

## 📁 4. Repository File & Folder Hierarchy

```

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

---

## 🔄 5. Complete Operational Flowcharts & Lifecycles

### A. User Registration & AES-256 Encryption Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant Form as register.html (Frontend)
    participant Server as server.js (/api/register)
    participant Crypto as utils/encryption.js
    participant DB as Neon PostgreSQL (users2)

    User->>Form: Submit Fullname, Username, Email, Phone, Password
    Form->>Form: Client-side validation & sanitize inputs
    Form->>Server: POST /api/register { fullname, username, email, phone, password }
    Server->>Server: Validate mandatory fields & payload types
    
    Server->>Crypto: hashEmail(email) -> SHA-256 Hex Hash
    Crypto-->>Server: email_hash
    Server->>Crypto: encrypt(email) -> AES-256-CBC IV:Ciphertext
    Crypto-->>Server: email_encrypted
    Server->>Crypto: encrypt(phone) -> AES-256-CBC IV:Ciphertext
    Crypto-->>Server: phone_encrypted
    Server->>Server: bcrypt.hash(password, 10) -> Salted Hash
    
    Server->>DB: INSERT INTO users2 (fullname, username, email_hash, email_encrypted, phone, password)
    alt Email Already Exists (Code 23505)
        DB-->>Server: Unique Constraint Violation
        Server-->>Form: HTTP 400 {"success": false, "error": "Email already exists"}
        Form-->>User: Display duplicate email alert
    else Registration Successful
        DB-->>Server: Query OK (Row Inserted)
        Server-->>Form: HTTP 200 {"success": true, "message": "User registered"}
        Form-->>User: Success toast & auto-redirect to login.html
    end
```

---

### B. Secure Login & URL Obfuscation Navigation Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant LoginUI as login.html (Frontend)
    participant Encryptor as url-encryptor.js (Client)
    participant Server as server.js (/api/login)
    participant DB as Neon PostgreSQL (users2)
    participant RouteResolver as Server Route Handler (/e/:token)

    User->>LoginUI: Enter Email & Password
    LoginUI->>Server: POST /api/login { email, password }
    Server->>Server: hashEmail(email) -> SHA-256
    Server->>DB: SELECT * FROM users2 WHERE email_hash = $1
    DB-->>Server: User record (or null)

    alt User Not Found
        Server-->>LoginUI: HTTP 400 {"error": "User not found"}
        LoginUI-->>User: Show "User not found" error
    else User Found
        Server->>Server: bcrypt.compare(password, stored_hash)
        alt Password Mismatch
            Server-->>LoginUI: HTTP 401 {"error": "Wrong password"}
            LoginUI-->>User: Show "Wrong password" error
        else Password Valid
            Server->>Server: Decrypt email & phone for session profile
            Server-->>LoginUI: HTTP 200 { success: true, user: { fullname, username, email } }
            LoginUI->>Encryptor: encodeTargetToken("ai.html")
            Encryptor-->>LoginUI: Returns /e/YWkuaHRtbA
            LoginUI->>RouteResolver: Navigate to /e/:token
            RouteResolver->>RouteResolver: Decrypt token -> resolve to internal file
            RouteResolver-->>User: Stream ai.html UI with authenticated context
        end
    end
```

---

### C. MindHelix AI Chat Request Lifecycle (Multi-Model Fallback Cascade)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant ChatUI as 🌐 ai.html (MindHelix Assistant)
    participant Server as ⚙️ server.js (Express 5 Gateway)
    participant PrimaryModel as 🧠 Model 1: Liquid LFM (OpenRouter)
    participant FallbackModel as 🔄 Model 2: Nex N2.5 Pro (Fallback)
    participant FinalModel as 🛡️ Model 3: GLM 5.2 / Gemma

    %% Step 1: Client Input
    User->>ChatUI: Input prompt and click "Send"
    activate ChatUI
    ChatUI->>ChatUI: Append user prompt to chat history log
    ChatUI->>ChatUI: Display animated typing indicator & disable input

    %% Step 2: Gateway Ingress
    ChatUI->>Server: HTTP POST /chat { "message": "User prompt" }
    activate Server
    Server->>Server: Validate message payload & check OPENROUTER_API_KEY
    Server->>Server: Inject System Headers (HTTP-Referer, X-Title: "MindHelix AI")

    %% Step 3: Upstream Primary Inference
    Server->>PrimaryModel: POST https://openrouter.ai/api/v1/chat/completions<br/>{ model: "liquid/lfm-2.5-2.6b:free", messages: [{role: "user", content}] }
    activate PrimaryModel

    alt Primary Model Responds (200 OK)
        PrimaryModel-->>Server: HTTP 200 { choices: [{ message: { content: "AI Reply" } }] }
        deactivate PrimaryModel
    else Primary Rate Limited (HTTP 429 / 503 Overload)
        PrimaryModel-->>Server: HTTP 429 Rate Limit Exceeded
        Server->>FallbackModel: Fallback POST completions<br/>{ model: "nex-agi/nex-n2.5-pro:free", messages: [...] }
        activate FallbackModel
        alt Fallback Model Responds
            FallbackModel-->>Server: HTTP 200 { choices: [{ message: { content: "AI Reply" } }] }
            deactivate FallbackModel
        else Fallback Fails
            Server->>FinalModel: Tertiary Fallback (GLM 5.2 / Gemma)
            activate FinalModel
            FinalModel-->>Server: HTTP 200 { choices: [{ message: { content: "AI Reply" } }] }
            deactivate FinalModel
        end
    end

    %% Step 4: Gateway Egress
    Server-->>ChatUI: HTTP 200 OK { "reply": "AI response markdown" }
    deactivate Server

    %% Step 5: Client Presentation
    ChatUI->>ChatUI: Remove typing indicator
    ChatUI->>ChatUI: Parse Markdown & syntax-highlight code blocks
    ChatUI->>ChatUI: Attach interactive tools (Copy Code, Regenerate, Text-to-Speech)
    ChatUI-->>User: Render formatted AI response in Glassmorphic bubble
    deactivate ChatUI
```

---

### D. AI Image Synthesis Lifecycle (FLUX.1 & OpenRouter)

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Creator
    participant ImageUI as ai.html (Image Studio)
    participant Server as server.js (/api/generate-image)
    participant OpenRouterImg as OpenRouter AI Image API
    participant FluxEngine as Pollinations FLUX.1 Engine

    User->>ImageUI: Enter Prompt, select Style, Aspect Ratio & click "Generate"
    ImageUI->>Server: POST /api/generate-image { prompt, style, width, height }
    Server->>Server: Generate unique numeric seed & format prompt with style keywords
    
    alt OpenRouter Key Present
        Server->>OpenRouterImg: POST completions (black-forest-labs/flux-1-schnell)
        alt OpenRouter Returns Image URL
            OpenRouterImg-->>Server: Return URL payload
            Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "OpenRouter FLUX.1" }
        else Fallback to Direct Cluster
            Server->>FluxEngine: Direct prompt synthesis with seed & resolution
            FluxEngine-->>Server: Return synthesized direct render CDN
            Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "FLUX.1 AI Engine" }
        end
    else Direct Engine Fallback
        Server->>FluxEngine: Query FLUX.1 high-speed cluster
        FluxEngine-->>Server: Direct Render CDN URL
        Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "FLUX.1 AI Engine" }
    end

    ImageUI->>ImageUI: Preload image & reveal glassmorphic preview card
    ImageUI-->>User: Render generated artwork with Download & Upscale actions
```

---

### E. Password Recovery & Reset Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant ForgotUI as forgot-password.html
    participant Server as server.js
    participant DB as Neon PostgreSQL (users2)
    participant SMTP as Gmail Nodemailer
    participant ResetUI as reset-password.html

    User->>ForgotUI: Enter registered Email
    ForgotUI->>Server: POST /forgot-password { email }
    Server->>Server: hashEmail(email)
    Server->>DB: SELECT id FROM users2 WHERE email_hash = $1
    alt Email Not Found
        DB-->>Server: 0 rows returned
        Server-->>ForgotUI: HTTP 400 {"error": "Email not found"}
    else Email Found
        Server->>Server: Generate UUID v4 Token & 15-min Expiration (Date.now() + 900000)
        Server->>DB: UPDATE users2 SET reset_token = $1, reset_token_expiry = $2 WHERE email_hash = $3
        Server->>SMTP: transporter.sendMail({ to, resetLink: "/reset-password?token=..." })
        SMTP-->>Server: Mail sent successfully
        Server-->>ForgotUI: HTTP 200 {"success": true, "message": "Reset email sent"}
        ForgotUI-->>User: Redirect to "forget succefull.html" confirmation view
    end

    %% Reset Phase
    User->>ResetUI: Opens reset link from email (/reset-password?token=xyz)
    User->>ResetUI: Enters new password & submits
    ResetUI->>Server: POST /reset-password { token, password }
    Server->>DB: SELECT id, reset_token_expiry FROM users2 WHERE reset_token = $1
    alt Token Missing or Expired
        Server-->>ResetUI: HTTP 400 {"error": "Token has expired or is invalid"}
    else Token Valid
        Server->>Server: bcrypt.hash(new_password, 10)
        Server->>DB: UPDATE users2 SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2
        Server-->>ResetUI: HTTP 200 {"success": true, "message": "Password updated successfully"}
        ResetUI-->>User: Show success checkmark & redirect to login.html
    end
```

---

### F. GDPR-Compliant Neon Dynamic Data Masking Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin / Dashboard Client
    participant Server as server.js (/api/neon-masking)
    participant DB as Neon PostgreSQL (users2)
    participant Crypto as utils/encryption.js

    Admin->>Server: GET /api/neon-masking
    Server->>DB: SELECT id, fullname, username, email_encrypted, phone FROM users2 LIMIT 10
    DB-->>Server: Return encrypted rows
    loop For Each User Record
        Server->>Crypto: decrypt(email_encrypted) -> plaintext email
        Server->>Crypto: maskEmail(plaintext) -> e.g. "dh***i@gmail.com"
        Server->>Crypto: decrypt(phone) -> plaintext phone
        Server->>Crypto: maskPhone(plaintext) -> e.g. "987****321"
    end
    Server-->>Admin: HTTP 200 { neonDatabase: "Connected", dataMaskingStatus: "Active", maskedData: [...] }
```

---

## 🗄️ 6. Database Schema & Data Dictionary

```sql
CREATE TABLE IF NOT EXISTS users2 (
    id                   SERIAL PRIMARY KEY,
    fullname             TEXT NOT NULL,
    username             TEXT NOT NULL,
    email_hash           TEXT UNIQUE NOT NULL,       -- SHA-256 deterministic hash for O(1) lookups
    email_encrypted      TEXT NOT NULL,              -- AES-256-CBC ciphertext (IV:Ciphertext)
    phone                TEXT NOT NULL,              -- AES-256-CBC ciphertext (IV:Ciphertext)
    password             TEXT NOT NULL,              -- 10-round salted bcrypt hash
    reset_token          TEXT,                       -- RFC 4122 UUID v4 password recovery token
    reset_token_expiry   BIGINT                      -- Millisecond epoch timestamp (15-minute TTL)
);

CREATE INDEX idx_users2_email_hash ON users2(email_hash);
CREATE INDEX idx_users2_reset_token ON users2(reset_token);
```

---

## 🚀 7. Multi-Platform Compilation & Deployment Architecture

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

## ⚙️ 8. Environment Configuration & Quick Start

### Environment Variables (`.env`)
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/mindhelix_db?schema=public"
ENCRYPTION_KEY="your-super-secret-32-byte-master-encryption-key"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="liquid/lfm-2.5-2.6b:free"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-google-app-password"
```

### Execution Commands
```bash
# Start backend server in development mode
npm run dev

# Start backend server in production mode
npm start

# Run native Windows desktop app (Electron)
npm run electron

# Sync mobile web assets with Android Studio (Capacitor)
npx cap sync android
```
