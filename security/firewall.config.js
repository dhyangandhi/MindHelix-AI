/**
 * MindHelix AI - 4-Layer Security Firewall Configuration
 * Comprehensive defense-in-depth rules matrix
 */

module.exports = {
  enabled: true,
  environment: process.env.NODE_ENV || "production",

  // ==========================================
  // LAYER 1: PERIMETER & EDGE NETWORK FIREWALL
  // ==========================================
  layer1: {
    name: "Perimeter & Edge Network Shield",
    enabled: true,
    headers: {
      "Content-Security-Policy": "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; font-src 'self' https: data:; frame-ancestors 'self';",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "X-XSS-Protection": "1; mode=block",
      "X-Firewall-Architecture": "MindHelix-4Layers-v2.0"
    },
    rateLimiting: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 180, // Max requests per window per IP
      banThreshold: 300, // Auto-ban IP if burst exceeds this in 1 window
      banDurationMs: 15 * 60 * 1000 // 15 minutes ban
    },
    allowedMethods: ["GET", "POST", "OPTIONS", "HEAD", "PUT", "DELETE"],
    blockedMethods: ["TRACE", "TRACK", "CONNECT", "DEBUG"],
    ipBlacklist: [],
    ipWhitelist: ["127.0.0.1", "::1", "localhost"]
  },

  // ==========================================
  // LAYER 2: WEB APPLICATION FIREWALL (WAF) & DEEP INSPECTION
  // ==========================================
  layer2: {
    name: "Web Application Firewall (WAF)",
    enabled: true,
    maxBodySizeBytes: 2 * 1024 * 1024, // 2MB max JSON body
    signatures: {
      sqli: [
        /(\b(union(\s+all)?)\b\s+select)/i,
        /(\bselect\b.+\bfrom\b.+\binformation_schema\b)/i,
        /(\b(drop|truncate|alter)\b\s+(table|database))/i,
        /(\b(exec|execute)\s*\(|\bxp_\w+)/i,
        /(\bwaitfor\s+delay\b|\bbenchmark\s*\(|\bpg_sleep\s*\()/i,
        /('\s*or\s*('?[0-9a-z]+'?\s*=\s*'?[0-9a-z]+'?|1=1))/i,
        /(\bor\s+1\s*=\s*1\b|\band\s+1\s*=\s*2\b)/i,
        /(--|\/\*|\*\/|;\s*--)/
      ],
      xss: [
        /<script\b[^>]*>[\s\S]*?<\/script>/i,
        /<script\b[^>]*>/i,
        /javascript\s*:/i,
        /vbscript\s*:/i,
        /data\s*:\s*text\/html/i,
        /<iframe\b[^>]*>/i,
        /\bon(load|error|click|mouseover|mouseenter|focus|blur|change|submit)\s*=/i,
        /<svg\b[^>]*\bon\w+\s*=/i,
        /\bdocument\.(cookie|location|domain)\b/i
      ],
      pathTraversal: [
        /(\.\.[\/\\]|\.\.%2f|\.\.%5c)/i,
        /(%2e%2e[\/\\]|%2e%2e%2f|%2e%2e%5c)/i,
        /(\/etc\/(passwd|shadow|hosts|group))/i,
        /([a-z]:[\/\\]windows[\/\\](system32|win\.ini))/i,
        /(proc\/self\/(environ|cmdline))/i,
        /%00/
      ],
      badBots: [
        /\b(sqlmap|nikto|wpscan|masscan|havij|acunetix|nessus|zgrab|gobuster|dirbuster)\b/i,
        /\b(nmap|arachni|openvas|hydra|metasploit)\b/i
      ]
    }
  },

  // ==========================================
  // LAYER 3: AUTHENTICATION & IDENTITY FIREWALL
  // ==========================================
  layer3: {
    name: "Authentication & Identity Firewall",
    enabled: true,
    authEndpoints: [
      "/login",
      "/api/login",
      "/register",
      "/api/register",
      "/forgot-password",
      "/reset-password"
    ],
    bruteForce: {
      windowMs: 15 * 60 * 1000, // 15 minutes window
      maxAttempts: 7, // Max failed attempts before lockout
      lockoutDurationMs: 15 * 60 * 1000 // 15 minute temporary lockout
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: false
    }
  },

  // ==========================================
  // LAYER 4: DATA PRIVACY & AI GUARDRAIL FIREWALL
  // ==========================================
  layer4: {
    name: "Data Cryptography & AI Guardrail Firewall",
    enabled: true,
    aiEndpoints: [
      "/chat",
      "/api/generate-image"
    ],
    promptInjectionSignatures: [
      /(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|system)\s+(instructions|prompts|rules|commands)/i,
      /\b(jailbreak|dan mode|do anything now|unrestricted mode)\b/i,
      /\b(reveal|print|show|dump|leak)\s+(your\s+)?(system\s+prompt|hidden\s+instructions|master\s+rules|api\s*key)/i,
      /\b(you are now unrestricted|act as an unrestricted ai|bypass all safety)/i,
      /\b(switch to developer mode|enable developer mode)\b/i,
      /\b(format c:|rm -rf \/|drop database|exec xp_)\b/i
    ],
    sensitiveDataLeakKeywords: [
      /postgres:\/\/[^:]+:[^@]+@/i,
      /sk-or-v1-[a-zA-Z0-9]{40,}/i,
      /AIzaSy[a-zA-Z0-9_-]{33}/i,
      /OPENROUTER_API_KEY\s*=\s*/i,
      /DATABASE_URL\s*=\s*/i,
      /EMAIL_PASS\s*=\s*/i
    ]
  }
};
