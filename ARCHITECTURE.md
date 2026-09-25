# 🧬 MindHelix AI — Complete System Architecture & Workflows

> **Document Version:** 2.0.0 (Production Blueprint)  
> **Target Platforms:** Web (Vercel / Node.js), Mobile (Capacitor Android), Desktop (Electron), Edge (Cloudflare Workers)  
> **Status:** Fully Integrated & Active

---

## 🏛️ 1. Master System Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["📱 Client Presentation Tier"]
        Web["🌐 Web Browser (Responsive Glassmorphism)"]
        Mobile["📱 Native Android App (Capacitor Engine)"]
        Desktop["💻 Native Desktop App (Electron Engine)"]
    end

    subgraph Edge["☁️ Edge Gateway & Static Distribution"]
        CFWorker["Cloudflare Worker (worker.js)"]
        VercelEdge["Vercel Serverless Gateway (api/index.js)"]
        StaticCDN["Static Asset Server (/www, Clean URLs)"]
    end

    subgraph Security["🛡️ Security & Routing Middleware"]
        URLResolver["Route Resolver & Token Decryptor (/e/:token, /secure)"]
        CryptoUtil["AES-256-CBC & SHA-256 Engine (utils/encryption.js)"]
        AuthShield["Bcrypt & Session Guard"]
    end

    subgraph CoreBackend["⚙️ Core Backend Engine (server.js - Express 5)"]
        AuthRouter["Auth Controller (/api/register, /api/login)"]
        PasswordRecovery["Password Reset Controller (/forgot-password, /reset-password)"]
        AIChatProxy["AI Chat Service (/chat - Model Fallback Cascade)"]
        ImageGenService["AI Image Synthesis (/api/generate-image)"]
        DataMasking["Neon Data Masking Service (/api/neon-masking)"]
    end

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

## 🔄 2. End-to-End System Workflows

### Workflow 1: User Registration, AES-256 Encryption & Data Storage

This workflow ensures zero-plaintext persistence for sensitive personal identifiable information (PII). Passwords are salt-hashed using bcrypt, emails are hashed via SHA-256 for O(1) duplicate checks and lookup indexing, and both email and phone numbers are encrypted with AES-256-CBC.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant Form as register.html (Frontend)
    participant Server as server.js (/api/register)
    participant Crypto as utils/encryption.js
    participant DB as Neon PostgreSQL (users2)

    User->>Form: Fill Name, Username, Email, Phone, Password
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

### Workflow 2: Secure Login & URL Token Obfuscation Navigation

MindHelix AI features an encrypted routing subsystem (`/e/:token` and `/secure?token=...`). Navigation destinations are obfuscated using Base64URL and AES-256 hashes to prevent direct page exposure and unauthorized manual tampering.

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
            LoginUI->>Encryptor: encodeTargetToken("ai.html" or "dashbord.html")
            Encryptor-->>LoginUI: Returns /e/YWkuaHRtbA or /secure?token=...
            LoginUI->>RouteResolver: Navigate to /e/:token
            RouteResolver->>RouteResolver: Decrypt token -> resolve to internal file
            RouteResolver-->>User: Stream ai.html / dashbord.html UI with authenticated context
        end
    end
```

---

### Workflow 3: MindHelix AI Conversational Hub & Multi-Model Fallback Cascade

The AI Chat system integrates an automatic fault-tolerant multi-model fallback cascade. If the primary model encounters rate limits or upstream timeouts, the gateway automatically falls back to secondary and tertiary high-speed reasoning models.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant AIChatUI as ai.html (Chat Interface)
    participant Gateway as server.js (POST /chat)
    participant PrimaryModel as Model 1: liquid/lfm-2.5-2.6b:free
    participant SecondaryModel as Model 2: nex-agi/nex-n2.5-pro:free
    participant FallbackModel as Model 3: z-ai/glm-5.2:free

    User->>AIChatUI: Types prompt & clicks "Send"
    AIChatUI->>AIChatUI: Render User bubble, start typing indicator
    AIChatUI->>Gateway: POST /chat { message: "Prompt" }
    
    Gateway->>PrimaryModel: POST OpenRouter /completions (Liquid LFM)
    alt Primary Model Responds (200 OK)
        PrimaryModel-->>Gateway: { choices: [{ message: { content: "AI Reply" } }] }
        Gateway-->>AIChatUI: HTTP 200 { reply: "AI Reply" }
    else Primary Rate Limited / Error
        PrimaryModel-->>Gateway: HTTP 429 / 503 Error
        Gateway->>SecondaryModel: Fallback POST (Nex N2.5 Pro)
        alt Secondary Model Responds
            SecondaryModel-->>Gateway: { choices: [{ message: { content: "AI Reply" } }] }
            Gateway-->>AIChatUI: HTTP 200 { reply: "AI Reply" }
        else Secondary Fails
            Gateway->>FallbackModel: Fallback POST (GLM 5.2 / Gemma)
            FallbackModel-->>Gateway: Return completion payload
            Gateway-->>AIChatUI: HTTP 200 { reply: "AI Reply" }
        end
    end

    AIChatUI->>AIChatUI: Parse Markdown, highlight code blocks, render to chat log
    AIChatUI-->>User: Display formatted AI response with Copy & Action tools
```

---

### Workflow 4: AI Image Synthesis Pipeline (FLUX.1 & OpenRouter)

Users can prompt the image engine with style presets (Cinematic, Anime, Cyberpunk, 3D Render, etc.), dimensions, and seed control.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Creator
    participant ImageUI as ai.html / Image Studio
    participant Server as server.js (/api/generate-image)
    participant OpenRouterImg as OpenRouter AI Image API (FLUX.1 Schnell)
    participant FluxEngine as Pollinations FLUX.1 / SDXL Engine

    User->>ImageUI: Enter Prompt, select Style, Aspect Ratio & click "Generate"
    ImageUI->>Server: POST /api/generate-image { prompt, style, width, height }
    Server->>Server: Generate unique numeric seed & format prompt with style keywords
    
    alt OpenRouter Key Configured
        Server->>OpenRouterImg: POST chat/completions (black-forest-labs/flux-1-schnell)
        alt OpenRouter Returns Image URL
            OpenRouterImg-->>Server: Return image URL in payload
            Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "OpenRouter FLUX.1" }
        else Rate Limit / Failure
            Server->>FluxEngine: Direct FLUX.1 synthesis with seed & resolution
            FluxEngine-->>Server: Synthesized Direct Render Stream
            Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "FLUX.1 AI Engine" }
        end
    else Direct Engine Fallback
        Server->>FluxEngine: Query FLUX.1 high-speed cluster
        FluxEngine-->>Server: Direct Render CDN URL
        Server-->>ImageUI: HTTP 200 { success: true, imageUrl, provider: "FLUX.1 AI Engine" }
    end

    ImageUI->>ImageUI: Preload image, reveal glassmorphism preview card
    ImageUI-->>User: Render full-resolution generated image with Download & Prompt actions
```

---

### Workflow 5: Forgot & Reset Password Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant ForgotUI as forgot-password.html
    participant Server as server.js
    participant DB as Neon PostgreSQL (users2)
    participant SMTP as Gmail Nodemailer Service
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
        Server->>DB: UPDATE users2 SET reset_token = $1, reset_token_expiry = $2
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

### Workflow 6: Data Privacy & Neon Dynamic Data Masking

The system provides GDPR-compliant data masking via `/api/neon-masking` for administrative views, reporting, and secure audits.

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

## 🚀 3. Cross-Platform Compilation & Deployment Architecture

```mermaid
flowchart TD
    subgraph Codebase["📁 Universal Source Code (MindHelix AI)"]
        WWW["www/ Assets\n(HTML5, CSS3, Vanilla JS, Glassmorphic UI)"]
        API["Node.js / Express 5 API\n(server.js, utils/encryption.js)"]
        Configs["capacitor.config.json & main.js"]
    end

    subgraph Targets["🎯 Multi-Platform Production Targets"]
        T_Web["🌐 Web Platform\nVercel Serverless & Node.js Hosted (Port 3000)"]
        T_Android["📱 Android OS\nCapacitor CLI -> Android Studio Gradle -> Native APK"]
        T_Desktop["💻 Windows Desktop\nElectron Native Shell -> Single Executable (.exe)"]
        T_Edge["⚡ Cloudflare Workers\nEdge V8 Engine (worker.js)"]
    end

    WWW --> T_Web
    API --> T_Web
    
    WWW -->|npx cap sync android| T_Android
    Configs --> T_Android

    WWW -->|npm run electron| T_Desktop
    Configs --> T_Desktop

    WWW -->|wrangler deploy| T_Edge
    Configs --> T_Edge
```

---

## 📋 4. Key Endpoints & Routing Matrix

| Route / Method | Handler | Purpose | Security / Encryption |
| :--- | :--- | :--- | :--- |
| `GET /` or `/home` | `sendFileSafe(home.html)` | Landing Page & Hero Section | Public |
| `GET /e/:token` | `resolveRouteFile(decoded)` | Obfuscated Route Navigation | Base64URL + AES-256 Decrypt |
| `GET /secure` | `resolveRouteFile(decrypt(token))`| Secure Parameter Navigation | AES-256-CBC Decrypt |
| `GET /firewall` | `sendFileSafe(firewall.html)` | 4-Layer Security Control Center | Layer 1 Perimeter Protected |
| `GET /api/firewall/status` | `firewall.getMetrics()` | Live Firewall Telemetry & Counters | Public / Admin Telemetry |
| `GET /api/firewall/events` | `firewall.recentEvents` | Live Blocked Security Event Stream | Layer 1 Protected |
| `POST /api/firewall/test` | `firewall.testPayload()` | Live Attack Vector Simulator | Layer 1-4 Deep Inspection |
| `POST /api/firewall/block-ip` | `firewall.blockIP()` | Dynamic IP Quarantine Control | Admin Operation Guard |
| `POST /api/firewall/unblock-ip`| `firewall.unblockIP()` | IP Quarantine Release | Admin Operation Guard |
| `POST /api/register` | `server.js` | User Registration | L3 Entropy Guard, SHA-256 Hash, AES-256 PII, Bcrypt |
| `POST /api/login` | `server.js` | User Authentication | L3 Brute-Force Shield, Bcrypt Compare, AES Decrypt |
| `POST /chat` | `server.js` | MindHelix AI Conversational Hub | L4 Prompt Injection & Egress Leak Guard, Multi-Model |
| `POST /api/generate-image` | `server.js` | AI Image Synthesis | L4 Prompt Injection Guard, FLUX.1 + OpenRouter |
| `POST /forgot-password` | `server.js` | Reset Token Dispatch | UUID v4, 15-min TTL, Gmail Nodemailer |
| `POST /reset-password` | `server.js` | Password Overwrite | Token Expiry Validation, Bcrypt Re-hash |
| `GET /api/neon-masking`| `server.js` | Data Privacy Masking Audit | Decrypt -> Pattern Mask (`us***r@domain.com`) |

---

## 🛡️ 5. 4-Layer Defense-in-Depth Security Firewall Architecture

MindHelix AI incorporates an enterprise-grade **4-Layer Security Firewall Engine** (`security/firewall.js` and `bin/firewall.js`), providing active defense across all platforms:

```mermaid
flowchart TD
    Req(["Incoming Client Request (HTTP / HTTPS)"])

    subgraph Layer1["🛡️ Layer 1: Perimeter & Edge Network Shield"]
        L1_Headers["Enterprise Security Headers\n(CSP, HSTS, X-Frame-Options, X-Content-Type)"]
        L1_RateLimit{"Sliding-Window Rate Limiter\n(180 req / 60s per IP)"}
        L1_Method{"HTTP Method Whitelist\n(Block TRACE, TRACK, CONNECT)"}
        L1_IPBan{"Dynamic IP Quarantine\n(Auto-ban on DDoS burst)"}
    end

    subgraph Layer2["🔥 Layer 2: Web Application Firewall (WAF)"]
        L2_Parser["Deep Payload Unpacker\n(Query, URL Params, Body, Headers)"]
        L2_SQLi{"SQL Injection Filter\n(UNION, Tautologies, Blind pg_sleep)"}
        L2_XSS{"XSS & Script Injection Filter\n(<script>, event handlers, <iframe>)"}
        L2_Traversal{"Path Traversal Neutralizer\n(../../, %2e%2e, null byte %00)"}
        L2_Bot{"Scanner & Bad Bot Interceptor\n(sqlmap, nikto, wpscan)"}
    end

    subgraph Layer3["👤 Layer 3: Authentication & Identity Firewall"]
        L3_BruteForce{"7-Strike Brute-Force Shield\n(15-min sliding lockout)"}
        L3_Entropy{"Password Entropy Verifier\n(Length, character sets, entropy score)"}
        L3_Timing["Timing-Safe Cryptography\n(crypto.timingSafeEqual comparison)"]
        L3_RouteAuth["Obfuscated Route Token Verifier\n(AES-256 / Base64URL tamper check)"]
    end

    subgraph Layer4["🧠 Layer 4: Data Cryptography & AI Guardrail Firewall"]
        L4_Prompt{"AI Prompt Injection & Jailbreak Guard\n('ignore previous instructions', DAN mode, system prompt leak)"}
        L4_Crypto["Zero-Plaintext Persistence\n(AES-256-CBC PII + SHA-256 Blind Indexing)"]
        L4_Masking["Dynamic PII Data Masking\n(Admin views & audit logs redaction)"]
        L4_Egress{"AI Egress Leak Scrubber\n(Scans responses for DB strings & API keys)"}
    end

    AppController[("🚀 Controller / Neon DB / OpenRouter AI")]
    Reject(["🚫 HTTP 400/403/405/429 Blocked Response\n(Telemetry Event Logged)"])

    Req --> L1_Headers
    L1_Headers --> L1_Method
    L1_Method -- Invalid Method --> Reject
    L1_Method -- Valid --> L1_IPBan
    L1_IPBan -- Quarantined IP --> Reject
    L1_IPBan -- Clear --> L1_RateLimit
    L1_RateLimit -- Rate Exceeded --> Reject

    L1_RateLimit -- Passed L1 --> L2_Parser
    L2_Parser --> L2_SQLi
    L2_SQLi -- Malicious Pattern --> Reject
    L2_SQLi -- Clean --> L2_XSS
    L2_XSS -- Malicious Script --> Reject
    L2_XSS -- Clean --> L2_Traversal
    L2_Traversal -- Traversal Attempt --> Reject
    L2_Traversal -- Clean --> L2_Bot
    L2_Bot -- Scanner Found --> Reject

    L2_Bot -- Passed L2 --> L3_BruteForce
    L3_BruteForce -- Locked Out --> Reject
    L3_BruteForce -- Permitted --> L3_Entropy
    L3_Entropy -- Weak Password --> Reject
    L3_Entropy -- Valid --> L3_Timing & L3_RouteAuth

    L3_Timing & L3_RouteAuth -- Passed L3 --> L4_Prompt
    L4_Prompt -- Jailbreak Attempt --> Reject
    L4_Prompt -- Clean Prompt --> AppController
    AppController --> L4_Crypto & L4_Masking
    AppController --> L4_Egress
    L4_Egress -- Scrubbed Safe Output --> Output(["Client Clean Response (200 OK)"])
```

### 4-Layer Defense Capabilities

| Layer | Component | Defense Mechanisms | Threat Mitigations |
| :--- | :--- | :--- | :--- |
| **Layer 1** | **Perimeter & Edge Shield** | CSP, HSTS, X-Frame-Options, 180 req/min rate limit, IP Quarantining, Method filter | DDoS floods, clickjacking, MIME sniffing, protocol abuse |
| **Layer 2** | **Web App Firewall (WAF)** | Recursive payload scanning, regex signature heuristics for SQLi, XSS, Path Traversal | SQL Injection, Stored/Reflected XSS, Directory Traversal, automated scanners |
| **Layer 3** | **Identity & Auth Shield** | 7-strike sliding-window lockout, password entropy calculator, constant-time compare | Brute-force attacks, credential stuffing, side-channel timing attacks |
| **Layer 4** | **Data & AI Guardrails** | AI prompt injection detector, jailbreak interceptor, egress credential scrubber, AES-256-CBC | Prompt injections, system prompt extraction, credential leaks, plaintext PII leaks |

---

## 🔨 6. Firewall Build & Verification Pipeline

MindHelix AI includes a dedicated CLI build tool (`bin/firewall.js`):

```bash
# 1. Compile & Hash the Firewall Rule Matrix
npm run build:firewall
# or: node bin/firewall.js --build

# 2. Execute Automated 16-Vector Attack Penetration Test Suite
npm run test:firewall
# or: npm test

# 3. Generate Formal Security Audit Markdown Report
npm run audit:firewall

# 4. View Real-Time Defense Telemetry
node bin/firewall.js --status
```

