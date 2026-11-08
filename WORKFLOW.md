# 🚀 MindHelix AI — End-to-End System Workflows & Architecture Blueprint

> **Platform Version:** 2.5.0 (Enterprise Neural Edition)  
> **Repository:** [MindHelix AI](https://github.com/MindHelix/MindHelix-AI)  
> **Status:** Production Active & Synchronized  
> **Diagram Format:** GitHub Native Mermaid

---

## 📑 Table of Contents
1. [Master System Architecture](#-1-master-system-architecture)
2. [GitHub CI/CD Automation Pipeline](#-2-github-cicd-automation-pipeline)
3. [AI Model Fallback Cascade & Specialist Personas](#-3-ai-model-fallback-cascade--specialist-personas)
4. [Live Server & noVNC Sandbox Execution Workflow](#-4-live-server--novnc-sandbox-execution-workflow)
5. [Navbar UI Controls & Minimize State Machine](#-5-navbar-ui-controls--minimize-state-machine)
6. [Data Flow & Security Firewall](#-6-data-flow--security-firewall)

---

## 🏛️ 1. Master System Architecture

This architectural blueprint outlines how MindHelix AI routes client requests through edge middleware, AI model hubs, local code execution sandboxes, and remote HTML5 noVNC containers.

```mermaid
flowchart TB
    %% ==========================================
    %% CLIENT LAYER
    %% ==========================================
    subgraph Clients["📱 Multi-Platform Presentation Tier"]
        WebClient["🌐 Web Browser (Responsive Glassmorphism)"]
        MobileApp["📱 Android Native (Capacitor v8 Engine)"]
        DesktopApp["💻 Desktop App (Electron v42 Chromium)"]
    end

    %% ==========================================
    %% TOP NAVBAR & INTERACTION TIER
    %% ==========================================
    subgraph NavbarTier["🎛️ Header Navigation & Control Tier"]
        NavBrand["MindHelix Brand & Online Status Dot"]
        ModelSelector["🧠 Centered AI Model Selector (Nemotron / DeepSeek / Llama / Qwen / Mistral)"]
        NavActions["⚡ Trial Countdown, Clear Chat & Sign Out"]
        MinimizeTab["▲ Center Minimize Tab (Smooth Collapse Engine)"]
    end

    %% ==========================================
    %% BACKEND & RUNTIME GATEWAY
    %% ==========================================
    subgraph BackendGateway["⚙️ Node.js & Express 5 API Gateway (server.js)"]
        ChatRouter["💬 /chat & /api/chat (Multi-turn Context & Cascade)"]
        CodeRunner["⚡ /api/run-code (Node.js, Python 3, Shell Sandbox)"]
        VNCConfig["🖥️ /api/vnc-config (Websockify & RFB Proxy)"]
        SecurityFirewall["🛡️ MindHelix Execution Firewall & Code Sanitizer"]
    end

    %% ==========================================
    %% AI INFERENCE HUBS
    %% ==========================================
    subgraph AICloud["🧠 Cloud AI Model Cascade (OpenRouter Gateway)"]
        Model1["⚡ NVIDIA Nemotron 3.5 Super VL (Primary Free)"]
        Model2["🧠 DeepSeek R1 Reasoning (Deep Logic)"]
        Model3["🦙 Meta Llama 3.3 70B Instruct (High Fidelity)"]
        Model4["💻 Qwen 2.5 Coder 32B (Programming Expert)"]
        Model5["💎 Mistral Nemo 12B (Fast Fallback)"]
    end

    %% ==========================================
    %% LIVE EXECUTION SANDBOXES
    %% ==========================================
    subgraph ExecutionSandbox["🗄️ Multi-Runtime Execution Workbench"]
        WebRunner["🌐 Tab 1: Live Web Server (HTML/CSS/JS + Console Bridge)"]
        TermRunner["💻 Tab 2: Backend Terminal (Stdout, Stderr, Stopwatch ms)"]
        VNCRunner["🖥️ Tab 3: HTML5 noVNC Desktop (RFB WebSocket Client)"]
        DockerGuide["🐳 Tab 4: 1-Click Ubuntu Desktop Container (Port 6080)"]
    end

    %% Interconnections
    Clients --> NavbarTier
    NavbarTier --> BackendGateway
    ChatRouter --> SecurityFirewall
    SecurityFirewall --> AICloud
    Model1 -. Fallback .-> Model2
    Model2 -. Fallback .-> Model3
    Model3 -. Fallback .-> Model4
    Model4 -. Fallback .-> Model5

    BackendGateway --> CodeRunner
    CodeRunner --> ExecutionSandbox
    VNCConfig --> VNCRunner
```

---

## 🔄 2. GitHub CI/CD Automation Pipeline

MindHelix AI utilizes an automated GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) to ensure rigorous security audits, zero-leak API token checks, 4-layer firewall compilation, multi-runtime code execution testing, and automated Docker compilation.

```mermaid
flowchart LR
    PushEvent(["Git Push / PR\n(main / master / dev)"]) --> SecAudit["🛡️ Stage 1: Security Audit\n- API Key Regex Scan\n- Dependency Audit\n- node bin/firewall.js --build\n- node bin/firewall.js --test"]
    
    SecAudit -->|Passed| TestSuite["🧪 Stage 2: Runtime Tests\n- Node.js Syntax Verification\n- Python 3 Engine Check\n- /api/run-code Smoke Tests"]
    
    TestSuite -->|Passed| DockerBuild["🐳 Stage 3: Container Build\n- Buildx Multi-Arch\n- Alpine Node.js 20 Image\n- Port 3000 Exposure"]
    
    DockerBuild -->|Passed| DeployStage["🚀 Stage 4: Production Deploy\n- Vercel Serverless Sync\n- Cloudflare Edge Sync\n- VPS Container Deployment"]

    SecAudit -.->|Key Leak / Sec Fail| FailFast["❌ Build Aborted\nSecurity Alert Dispatched"]
    TestSuite -.->|Test Failure| FailFast
```

---

## 🧠 3. AI Model Fallback Cascade & Specialist Personas

When a user submits a prompt, the system injects the selected specialist persona system instructions and dispatches the query through our resilient fallback cascade:

```mermaid
flowchart TD
    UserQuery(["User Submits Message"]) --> PersonaCheck{"Specialist Persona Selected?"}
    
    PersonaCheck -->|Architect| ArchSys["Inject: Senior Full-Stack Architect\n(Focus: Scalable system design, Clean Code)"]
    PersonaCheck -->|Security| SecSys["Inject: Cyber Security & WAF Expert\n(Focus: OWASP, Defense-in-depth, Pentest)"]
    PersonaCheck -->|DataScience| DSSys["Inject: Python & Data Science Specialist\n(Focus: Vectorization, NumPy, ML Models)"]
    PersonaCheck -->|General| GenSys["Inject: MindHelix Core Intelligence\n(Focus: Balanced, helpful, concise)"]

    ArchSys & SecSys & DSSys & GenSys --> Dispatcher["Dispatch Request to OpenRouter"]

    Dispatcher --> TryNemotron["1. Try: nvidia/nemotron-3.5-super-vl:free"]
    TryNemotron -->|200 OK| StreamToClient(["Stream Markdown Response to Chat UI"])
    
    TryNemotron -->|Rate Limit / 429| TryDeepSeek["2. Fallback: deepseek/deepseek-r1:free"]
    TryDeepSeek -->|200 OK| StreamToClient
    
    TryDeepSeek -->|Timeout / Error| TryLlama["3. Fallback: meta-llama/llama-3.3-70b-instruct:free"]
    TryLlama -->|200 OK| StreamToClient
    
    TryLlama -->|Unavailable| TryQwen["4. Fallback: qwen/qwen-2.5-coder-32b-instruct:free"]
    TryQwen -->|200 OK| StreamToClient
    
    TryQwen -->|Error| TryMistral["5. Fallback: mistralai/mistral-nemo:free"]
    TryMistral -->|200 OK| StreamToClient
```

---

## ⚡ 4. Live Server & noVNC Sandbox Execution Workflow

MindHelix allows direct execution of generated code blocks without leaving the conversation interface:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Developer
    participant UI as Chat UI (ai.html)
    participant Modal as Live Server Modal
    participant Engine as Backend Engine (server.js)
    participant Docker as Docker / noVNC Desktop (Port 6080)

    User->>UI: Clicks "Live Server" or "Run Code" on code block
    UI->>Modal: Open Modal & Populate Code into Editor
    
    alt HTML/CSS/JavaScript Preview (Tab 1)
        Modal->>Modal: Inject Base Dark Style & PostMessage Console Bridge
        Modal->>Modal: Update iframe.srcdoc in Dark Mode Sandbox
        Modal-->>User: Instant Dynamic DOM Render & Console Capture
    else Backend Execution (Tab 2: Node.js / Python / Bash)
        Modal->>Engine: POST /api/run-code { code, language, stdin }
        Engine->>Engine: Security Scan & Spawn Isolated Subprocess
        Engine-->>Modal: Return { stdout, stderr, executionTimeMs }
        Modal-->>User: Render Terminal Output with Millisecond Timer
    else Cloud GUI Desktop (Tab 3: noVNC Remote Desktop)
        Modal->>Docker: WebSocket Handshake (ws://localhost:6080/websockify)
        Docker-->>Modal: RFB Stream Initialized (Canvas Active)
        Modal->>Docker: Clipboard Synchronization (Paste Code)
        Docker-->>User: Interactive Linux Desktop with GUI
    end
```

### 4.1 Live Server Compiler & Auto-Fix Architecture

The Live Web Server integrates a single-line console bridge to guarantee **1:1 line number parity** and features an automated syntax resolution engine:

```mermaid
flowchart TD
    subgraph EditorStage["1. Code Input & Preparation"]
        InputCode["User Code in #lsWebCodeTextarea\n(or clicked from AI code block)"]
        CleanCheck["Sanitize Code Block\nStrip markdown code fences (```html)"]
        IsRawJS{"Pure JavaScript without HTML/Script tags?"}
        WrapScript["Auto-wrap with <script> tag"]
    end

    subgraph CompilerStage["2. Zero-Line-Offset Injection Engine"]
        SingleLineBridge["Inject 1-line consoleBridge + baseStyle\n(0 newlines added -> 100% 1:1 line parity)"]
        IframeCompile["Compile to iframe.srcdoc\n(sandbox: allow-scripts, allow-modals, allow-same-origin)"]
    end

    subgraph RuntimeStage["3. Sandboxed Browser Runtime"]
        DOMExec["Browser executes script inside iframe"]
        ConsolePostMsg["Intercept console.log / warn / error\npostMessage({type: 'MINDHELIX_CONSOLE'})"]
        ErrorCapture["window.onerror triggers on syntax/runtime error\nsends [Error Line X]: message"]
    end

    subgraph ErrorResolution["4. Interactive Error Handling & Auto-Fix"]
        ConsoleDrawer["Append Line to #lsWebConsoleBody"]
        HasLineErr{"Contains [Error Line X]?"}
        RenderJump["Render [Jump to Ln X] Pill\nFocus & scroll editor to exact line"]
        RenderAutoFix["Render [Auto-Fix] Pill\nClick to trigger auto-repair engine"]
        AutoFixEngine["autoFixWebEditorSyntax()\n- Decode stray HTML entities\n- Prefix unquoted commentary with // [Auto-Fix]\n- Recompile preview cleanly"]
    end

    InputCode --> CleanCheck
    CleanCheck --> IsRawJS
    IsRawJS -->|Yes| WrapScript --> SingleLineBridge
    IsRawJS -->|No| SingleLineBridge
    SingleLineBridge --> IframeCompile
    IframeCompile --> DOMExec
    DOMExec --> ConsolePostMsg --> ConsoleDrawer
    DOMExec --> ErrorCapture --> ConsoleDrawer
    ConsoleDrawer --> HasLineErr
    HasLineErr -->|Yes| RenderJump & RenderAutoFix
    RenderAutoFix --> AutoFixEngine
    AutoFixEngine -->|Updates code| InputCode
```

---

## 🎛️ 5. Navbar UI Controls & Centering Architecture

The navigation bar implements precision mathematical centering with responsive adaptive behaviors:

```mermaid
flowchart LR
    subgraph NavbarLayout["📐 Precision Mathematical Centering (Desktop >= 901px)"]
        BrandLeft["Left (Start)\n.brand / .brand-section\nz-index: 2"]
        CenterGroup["Center (Dead 50%)\nposition: absolute; left: 50%;\ntransform: translate(-50%, -50%);\nwidth: max-content;\nz-index: 10;\n(Model Selector / Nav Links)"]
        ActionsRight["Right (End)\n.nav-actions\nmargin-left: auto;\nz-index: 2"]
    end

    BrandLeft --- CenterGroup --- ActionsRight
```

### Navbar Minimize & State Machine

```mermaid
stateDiagram-v2
    [*] --> NavbarExpanded: Initial Page Load

    state NavbarExpanded {
        [*] --> Idle
        Idle --> ChangingModel: Select Model Dropdown
        ChangingModel --> Idle: Persisted to LocalStorage
        Idle --> LaunchSandbox: Click "Live Server"
        LaunchSandbox --> Idle: Modal Opened
    }

    NavbarExpanded --> NavbarMinimized: Click Center Tab (▲ Caret Up)
    note right of NavbarMinimized
        - translateY(-100%)
        - margin-bottom: -74px (No whitespace)
        - Tab hangs down with ▼ Caret Down
        - Full-screen distraction-free workspace
    end note

    NavbarMinimized --> NavbarExpanded: Click Center Tab (▼ Caret Down)
```

---

## 🛡️ 6. Data Flow & Security Firewall

Every transaction passing through the MindHelix ecosystem is protected by our defense-in-depth security model:

```mermaid
flowchart TD
    Input["Client Input Data"] --> Sanitize["1. XSS Escaping & Input Sanitization"]
    Sanitize --> AuthCheck{"Authenticated Session?"}
    
    AuthCheck -->|No| TrialCheck{"2-Minute Free Preview Active?"}
    TrialCheck -->|Expired| LockScreen["🔒 Lock Session & Prompt Authentication"]
    TrialCheck -->|Active| RouteRequest["Proceed with Trial Quota"]
    
    AuthCheck -->|Yes| RouteRequest
    
    RouteRequest --> CodeCheck{"Executing Code (/api/run-code)?"}
    CodeCheck -->|Yes| SandboxRules["Enforce: 15s Timeout, No Forkbombs, Isolate Workspace"]
    SandboxRules --> ExecuteCode["Run in Child Process Sandbox"]
    
    CodeCheck -->|No| ModelRoute["Forward to Model Gateway via SSL"]
```

---

## 🛠️ Quick Commands

| Task | Command |
| :--- | :--- |
| **Start Local App Server** | `node server.js` |
| **Run 1-Command Ubuntu Desktop noVNC** | `docker run -d -p 6080:80 -e RESOLUTION=1280x720 dorowu/ubuntu-desktop-lxde-vnc` |
| **Local Websockify Bridge** | `websockify 6080 localhost:5900` |
| **Trigger CI/CD Tests Locally** | `npm test` or `curl -X POST http://localhost:3000/api/run-code -H "Content-Type: application/json" -d '{"code":"console.log(1)","language":"javascript"}'` |

