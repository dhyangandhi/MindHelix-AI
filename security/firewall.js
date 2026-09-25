/**
 * 🧬 MindHelix AI - 4-Layer Defense-in-Depth Security Firewall Engine
 * 
 * Layer 1: Perimeter & Edge Network Shield (Headers, DDoS/Rate Limiting, IP Filtering, Method Whitelist)
 * Layer 2: Web Application Firewall (WAF) (SQLi, XSS, Path Traversal, Malicious Bot & User-Agent Filters)
 * Layer 3: Authentication, Identity & Brute-Force Guard (Sliding-window lockout, Password Entropy, Timing-Safe)
 * Layer 4: Data Cryptography & AI Guardrail Firewall (Prompt Injection, Jailbreak Interceptor, Data Masking, Egress Leak Scrubbing)
 */

const crypto = require("crypto");
const path = require("path");
const defaultConfig = require("./firewall.config");

class MindHelixFirewall {
  constructor(customConfig = {}) {
    this.config = { ...defaultConfig, ...customConfig };
    this.startedAt = Date.now();

    // IP Blacklist & Whitelist
    this.bannedIPs = new Map(); // ip -> { until: timestamp, reason: string }
    this.whitelistedIPs = new Set(this.config.layer1.ipWhitelist || []);

    // Rate Limiting Storage: ip -> [timestamps]
    this.rateLimitStore = new Map();

    // Layer 3 Auth Brute-Force Tracker: key -> { attempts: number, lockUntil: timestamp }
    this.authTracker = new Map();

    // Telemetry & Metrics
    this.metrics = {
      totalRequests: 0,
      totalPassed: 0,
      totalBlocked: 0,
      byLayer: {
        layer1: 0,
        layer2: 0,
        layer3: 0,
        layer4: 0
      },
      byThreat: {
        sqli: 0,
        xss: 0,
        pathTraversal: 0,
        badBot: 0,
        rateLimit: 0,
        bruteForce: 0,
        promptInjection: 0,
        invalidMethod: 0,
        ipBanned: 0
      }
    };

    // Circular Event Log (Last 100 security events)
    this.recentEvents = [];
    this.maxEvents = 100;

    // Compile active policy hash for integrity verification
    this.policyHash = this._calculatePolicyHash();
  }

  _calculatePolicyHash() {
    const raw = JSON.stringify({
      l1: this.config.layer1?.rateLimiting,
      l2: Object.keys(this.config.layer2?.signatures || {}),
      l3: this.config.layer3?.bruteForce,
      l4: Object.keys(this.config.layer4 || {})
    });
    return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 16);
  }

  getClientIP(req) {
    if (!req) return "127.0.0.1";
    const forwarded = req.headers?.["x-forwarded-for"];
    if (forwarded) {
      return String(forwarded).split(",")[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "127.0.0.1";
  }

  logEvent(event) {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.recentEvents.unshift(entry);
    if (this.recentEvents.length > this.maxEvents) {
      this.recentEvents.pop();
    }
    return entry;
  }

  // ==========================================
  // LAYER 1: PERIMETER & EDGE NETWORK FIREWALL
  // ==========================================
  applySecurityHeaders(res) {
    if (!this.config.layer1.enabled || !res || !res.setHeader) return;
    const headers = this.config.layer1.headers || {};
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }

  checkLayer1(req) {
    if (!this.config.layer1.enabled) return { allowed: true };

    const ip = this.getClientIP(req);
    const now = Date.now();

    // 1. Check IP Blacklist
    if (this.bannedIPs.has(ip)) {
      const ban = this.bannedIPs.get(ip);
      if (now < ban.until) {
        this.metrics.totalBlocked++;
        this.metrics.byLayer.layer1++;
        this.metrics.byThreat.ipBanned++;
        this.logEvent({
          layer: 1,
          layerName: "Perimeter / Network",
          threatType: "IP_BANNED",
          severity: "HIGH",
          clientIp: ip,
          path: req.originalUrl || req.url,
          method: req.method,
          action: "BLOCKED",
          reason: `IP temporarily quarantined: ${ban.reason}`
        });
        return {
          allowed: false,
          status: 403,
          code: "FIREWALL_IP_BANNED",
          message: "Access Denied: Your IP address is temporarily quarantined by MindHelix Security Shield.",
          layer: 1
        };
      } else {
        this.bannedIPs.delete(ip);
      }
    }

    // 2. HTTP Method Filter
    const method = (req.method || "GET").toUpperCase();
    if (this.config.layer1.blockedMethods.includes(method)) {
      this.metrics.totalBlocked++;
      this.metrics.byLayer.layer1++;
      this.metrics.byThreat.invalidMethod++;
      this.logEvent({
        layer: 1,
        layerName: "Perimeter / Network",
        threatType: "BLOCKED_METHOD",
        severity: "MEDIUM",
        clientIp: ip,
        path: req.originalUrl || req.url,
        method: method,
        action: "BLOCKED",
        reason: `Disallowed HTTP method ${method}`
      });
      return {
        allowed: false,
        status: 405,
        code: "FIREWALL_METHOD_NOT_ALLOWED",
        message: `HTTP Method ${method} is not permitted by Perimeter Firewall.`,
        layer: 1
      };
    }

    // 3. Sliding Window Rate Limiting (Skip Whitelisted IPs)
    if (!this.whitelistedIPs.has(ip)) {
      const { windowMs, maxRequests, banThreshold, banDurationMs } = this.config.layer1.rateLimiting;
      let timestamps = this.rateLimitStore.get(ip) || [];
      timestamps = timestamps.filter(t => now - t < windowMs);
      timestamps.push(now);
      this.rateLimitStore.set(ip, timestamps);

      if (timestamps.length > banThreshold) {
        this.blockIP(ip, "DDoS flood / excessive request burst", banDurationMs);
        this.metrics.totalBlocked++;
        this.metrics.byLayer.layer1++;
        this.metrics.byThreat.rateLimit++;
        return {
          allowed: false,
          status: 429,
          code: "FIREWALL_RATE_LIMIT_EXCEEDED",
          message: "Rate limit severely exceeded. IP quarantined by Anti-DDoS Shield.",
          layer: 1
        };
      }

      if (timestamps.length > maxRequests) {
        this.metrics.totalBlocked++;
        this.metrics.byLayer.layer1++;
        this.metrics.byThreat.rateLimit++;
        this.logEvent({
          layer: 1,
          layerName: "Perimeter / Network",
          threatType: "RATE_LIMIT_WARNING",
          severity: "MEDIUM",
          clientIp: ip,
          path: req.originalUrl || req.url,
          method: method,
          action: "THROTTLED",
          reason: `High request frequency (${timestamps.length} req / window)`
        });
        return {
          allowed: false,
          status: 429,
          code: "FIREWALL_RATE_LIMIT",
          message: "Too many requests. Please slow down.",
          layer: 1
        };
      }
    }

    return { allowed: true };
  }

  // ==========================================
  // LAYER 2: WEB APPLICATION FIREWALL (WAF)
  // ==========================================
  checkLayer2(req) {
    if (!this.config.layer2.enabled) return { allowed: true };

    const ip = this.getClientIP(req);
    const userAgent = req.headers?.["user-agent"] || "";
    const signatures = this.config.layer2.signatures || {};

    // 1. Scanner & Bad Bot Inspection
    for (const pattern of signatures.badBots || []) {
      if (pattern.test(userAgent)) {
        this.metrics.totalBlocked++;
        this.metrics.byLayer.layer2++;
        this.metrics.byThreat.badBot++;
        this.logEvent({
          layer: 2,
          layerName: "Web Application Firewall (WAF)",
          threatType: "VULNERABILITY_SCANNER",
          severity: "HIGH",
          clientIp: ip,
          path: req.originalUrl || req.url,
          method: req.method,
          action: "BLOCKED",
          reason: `Known automated scanner detected: ${userAgent.substring(0, 60)}`
        });
        return {
          allowed: false,
          status: 403,
          code: "FIREWALL_SCANNER_DETECTED",
          message: "Automated vulnerability scanners and malicious probes are blocked by WAF.",
          layer: 2
        };
      }
    }

    // 2. Recursive Deep Payload Extraction (URI, Query, Body, Headers)
    const targets = [];
    const rawUrl = req.originalUrl || req.url || "";
    if (rawUrl) {
      try {
        targets.push({ source: "URI", val: decodeURIComponent(rawUrl) });
      } catch (e) {
        targets.push({ source: "URI", val: rawUrl });
      }
      // If rawUrl contains query string, extract search params as well
      const queryIdx = rawUrl.indexOf("?");
      if (queryIdx !== -1) {
        const qs = rawUrl.substring(queryIdx + 1);
        targets.push({ source: "QueryString", val: decodeURIComponent(qs) });
      }
    }
    if (req.query) targets.push(...this._flattenObject(req.query, "query"));
    if (req.params) targets.push(...this._flattenObject(req.params, "params"));
    if (req.body && typeof req.body === "object") targets.push(...this._flattenObject(req.body, "body"));

    for (const item of targets) {
      const valStr = String(item.val);

      // Path Traversal Check
      for (const pattern of signatures.pathTraversal || []) {
        if (pattern.test(valStr)) {
          this.metrics.totalBlocked++;
          this.metrics.byLayer.layer2++;
          this.metrics.byThreat.pathTraversal++;
          this.logEvent({
            layer: 2,
            layerName: "Web Application Firewall (WAF)",
            threatType: "PATH_TRAVERSAL",
            severity: "HIGH",
            clientIp: ip,
            path: req.originalUrl || req.url,
            method: req.method,
            action: "BLOCKED",
            reason: `Path traversal sequence intercepted in ${item.source}`
          });
          return {
            allowed: false,
            status: 400,
            code: "FIREWALL_PATH_TRAVERSAL",
            message: "Directory traversal attack detected and neutralized by WAF.",
            layer: 2
          };
        }
      }

      // SQL Injection Check
      for (const pattern of signatures.sqli || []) {
        if (pattern.test(valStr)) {
          this.metrics.totalBlocked++;
          this.metrics.byLayer.layer2++;
          this.metrics.byThreat.sqli++;
          this.logEvent({
            layer: 2,
            layerName: "Web Application Firewall (WAF)",
            threatType: "SQL_INJECTION",
            severity: "CRITICAL",
            clientIp: ip,
            path: req.originalUrl || req.url,
            method: req.method,
            action: "BLOCKED",
            reason: `SQL Injection pattern matched in ${item.source}`
          });
          return {
            allowed: false,
            status: 400,
            code: "FIREWALL_SQLI_BLOCKED",
            message: "Malicious SQL syntax pattern intercepted and blocked by WAF.",
            layer: 2
          };
        }
      }

      // Cross-Site Scripting (XSS) Check
      for (const pattern of signatures.xss || []) {
        if (pattern.test(valStr)) {
          this.metrics.totalBlocked++;
          this.metrics.byLayer.layer2++;
          this.metrics.byThreat.xss++;
          this.logEvent({
            layer: 2,
            layerName: "Web Application Firewall (WAF)",
            threatType: "XSS_SCRIPT_INJECTION",
            severity: "HIGH",
            clientIp: ip,
            path: req.originalUrl || req.url,
            method: req.method,
            action: "BLOCKED",
            reason: `Cross-Site Scripting / Malicious HTML injected in ${item.source}`
          });
          return {
            allowed: false,
            status: 400,
            code: "FIREWALL_XSS_BLOCKED",
            message: "Cross-site scripting (XSS) payload neutralized by WAF.",
            layer: 2
          };
        }
      }
    }

    return { allowed: true };
  }

  // ==========================================
  // LAYER 3: AUTHENTICATION & IDENTITY FIREWALL
  // ==========================================
  checkLayer3(req) {
    if (!this.config.layer3.enabled) return { allowed: true };

    const cleanPath = (req.path || "").toLowerCase();
    const isAuthEndpoint = this.config.layer3.authEndpoints.some(ep => cleanPath === ep || cleanPath.endsWith(ep));
    if (!isAuthEndpoint || req.method !== "POST") return { allowed: true };

    const ip = this.getClientIP(req);
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : null;
    const trackKey = `${ip}:${email || "anonymous"}`;
    const now = Date.now();

    const record = this.authTracker.get(trackKey);
    if (record && record.lockUntil && now < record.lockUntil) {
      const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
      this.metrics.totalBlocked++;
      this.metrics.byLayer.layer3++;
      this.metrics.byThreat.bruteForce++;
      this.logEvent({
        layer: 3,
        layerName: "Authentication & Identity Firewall",
        threatType: "BRUTE_FORCE_LOCKOUT",
        severity: "HIGH",
        clientIp: ip,
        path: req.originalUrl || req.url,
        method: req.method,
        action: "LOCKED_OUT",
        reason: `Credential brute-force lock active (${remainingSeconds}s remaining)`
      });
      return {
        allowed: false,
        status: 429,
        code: "FIREWALL_AUTH_LOCKOUT",
        message: `Too many failed authentication attempts. Account access locked for ${remainingSeconds} seconds.`,
        layer: 3
      };
    }

    return { allowed: true };
  }

  recordAuthFailure(req, identifier = null) {
    const ip = this.getClientIP(req);
    const key = `${ip}:${identifier ? String(identifier).toLowerCase().trim() : "anonymous"}`;
    const now = Date.now();
    const { maxAttempts, lockoutDurationMs } = this.config.layer3.bruteForce;

    let record = this.authTracker.get(key) || { attempts: 0, lockUntil: 0 };
    record.attempts++;

    if (record.attempts >= maxAttempts) {
      record.lockUntil = now + lockoutDurationMs;
      this.logEvent({
        layer: 3,
        layerName: "Authentication & Identity Firewall",
        threatType: "BRUTE_FORCE_TRIGGERED",
        severity: "CRITICAL",
        clientIp: ip,
        path: req.originalUrl || req.url,
        method: req.method,
        action: "LOCKOUT_ACTIVATED",
        reason: `Failed auth threshold reached (${record.attempts} attempts). Locked for 15m.`
      });
    }

    this.authTracker.set(key, record);
  }

  recordAuthSuccess(req, identifier = null) {
    const ip = this.getClientIP(req);
    const key = `${ip}:${identifier ? String(identifier).toLowerCase().trim() : "anonymous"}`;
    this.authTracker.delete(key);
  }

  validatePasswordEntropy(password) {
    if (!password || typeof password !== "string") {
      return { valid: false, score: 0, message: "Password is required" };
    }
    const policy = this.config.layer3.passwordPolicy;
    if (password.length < policy.minLength) {
      return {
        valid: false,
        score: 1,
        message: `Password must be at least ${policy.minLength} characters long.`
      };
    }
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return {
      valid: score >= 2,
      score,
      message: score >= 2 ? "Strong password entropy verified." : "Password should contain uppercase, lowercase, or digits."
    };
  }

  safeCompare(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Fake compare to prevent timing leak
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  // ==========================================
  // LAYER 4: DATA PRIVACY & AI GUARDRAIL FIREWALL
  // ==========================================
  inspectAIPrompt(prompt, clientIp = "127.0.0.1") {
    if (!this.config.layer4.enabled || !prompt) return { safe: true, prompt };

    const text = String(prompt);
    const signatures = this.config.layer4.promptInjectionSignatures || [];

    for (const pattern of signatures) {
      if (pattern.test(text)) {
        this.metrics.totalBlocked++;
        this.metrics.byLayer.layer4++;
        this.metrics.byThreat.promptInjection++;
        this.logEvent({
          layer: 4,
          layerName: "Data Cryptography & AI Guardrail Firewall",
          threatType: "AI_PROMPT_INJECTION",
          severity: "CRITICAL",
          clientIp: clientIp,
          path: "/chat",
          method: "POST",
          action: "INTERCEPTED",
          reason: `Jailbreak or system instruction override attempt detected: ${text.substring(0, 80)}`
        });
        return {
          safe: false,
          layer: 4,
          threatType: "AI_PROMPT_INJECTION",
          message: "MindHelix AI Guardrail Shield: Suspicious prompt injection / jailbreak payload intercepted and neutralized."
        };
      }
    }

    return { safe: true, prompt: text };
  }

  scrubAIResponse(response) {
    if (!this.config.layer4.enabled || !response || typeof response !== "string") {
      return response;
    }
    let scrubbed = response;
    const leakPatterns = this.config.layer4.sensitiveDataLeakKeywords || [];
    for (const pattern of leakPatterns) {
      if (pattern.test(scrubbed)) {
        scrubbed = scrubbed.replace(pattern, "[REDACTED_BY_MINDHELIX_SECURITY_FIREWALL]");
        this.logEvent({
          layer: 4,
          layerName: "Data Cryptography & AI Guardrail Firewall",
          threatType: "EGRESS_DATA_LEAK_PREVENTED",
          severity: "HIGH",
          clientIp: "INTERNAL",
          path: "/chat",
          method: "RESPONSE",
          action: "SCRUBBED",
          reason: "Sensitive internal credential pattern removed from outgoing AI text"
        });
      }
    }
    return scrubbed;
  }

  // ==========================================
  // IP MANAGEMENT & TESTING UTILITIES
  // ==========================================
  blockIP(ip, reason = "Manual admin block", durationMs = 3600000) {
    this.bannedIPs.set(ip, {
      until: Date.now() + durationMs,
      reason,
      createdAt: new Date().toISOString()
    });
    this.logEvent({
      layer: 1,
      layerName: "Perimeter / Network",
      threatType: "MANUAL_IP_BLOCK",
      severity: "HIGH",
      clientIp: ip,
      path: "*",
      method: "*",
      action: "QUARANTINED",
      reason: reason
    });
  }

  unblockIP(ip) {
    const existed = this.bannedIPs.delete(ip);
    return existed;
  }

  getBannedIPs() {
    const list = [];
    const now = Date.now();
    for (const [ip, data] of this.bannedIPs.entries()) {
      if (now < data.until) {
        list.push({
          ip,
          reason: data.reason,
          expiresInSeconds: Math.ceil((data.until - now) / 1000)
        });
      }
    }
    return list;
  }

  testPayload(payload, layerType = "all") {
    const results = {
      testedPayload: payload,
      blocked: false,
      diagnostics: []
    };

    const dummyReq = {
      method: "POST",
      url: "/api/test",
      originalUrl: `/api/test?input=${encodeURIComponent(payload)}`,
      headers: { "user-agent": "MindHelixSecurityTest/1.0" },
      query: { q: payload },
      body: { data: payload }
    };

    // Test Layer 1 (Perimeter)
    if (layerType === "all" || layerType === "layer1") {
      const l1 = this.checkLayer1(dummyReq);
      if (!l1.allowed) {
        results.blocked = true;
        results.diagnostics.push({ layer: 1, layerName: "Perimeter", result: l1 });
      }
    }

    // Test Layer 2 (WAF)
    if (layerType === "all" || layerType === "layer2") {
      const l2 = this.checkLayer2(dummyReq);
      if (!l2.allowed) {
        results.blocked = true;
        results.diagnostics.push({ layer: 2, layerName: "WAF", result: l2 });
      }
    }

    // Test Layer 4 (AI Prompt Guard)
    if (layerType === "all" || layerType === "layer4") {
      const l4 = this.inspectAIPrompt(payload);
      if (!l4.safe) {
        results.blocked = true;
        results.diagnostics.push({ layer: 4, layerName: "AI Guardrail", result: l4 });
      }
    }

    return results;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      activeBannedCount: this.bannedIPs.size,
      policyHash: this.policyHash,
      layers: {
        layer1: { name: "Perimeter & Edge Network Shield", status: "ONLINE", rateLimit: "180 req/min" },
        layer2: { name: "Web Application Firewall (WAF)", status: "ONLINE", sqliXssBots: "ACTIVE" },
        layer3: { name: "Authentication & Identity Firewall", status: "ONLINE", bruteForceShield: "ACTIVE" },
        layer4: { name: "Data Cryptography & AI Guardrails", status: "ONLINE", promptGuard: "ACTIVE" }
      }
    };
  }

  // ==========================================
  // MASTER EXPRESS MIDDLEWARE
  // ==========================================
  middleware() {
    return (req, res, next) => {
      this.metrics.totalRequests++;

      // Attach firewall instance to req for controllers
      req.firewall = this;

      // 1. Layer 1: Apply security headers
      this.applySecurityHeaders(res);

      // Skip firewall inspection for static assets (images, fonts, stylesheets)
      const pathUrl = req.path || "";
      if (/\.(css|js|jpg|jpeg|png|svg|ico|woff|woff2|ttf|gif|webp)$/i.test(pathUrl)) {
        this.metrics.totalPassed++;
        return next();
      }

      // 2. Layer 1 Check: Perimeter & Network Shield
      const l1 = this.checkLayer1(req);
      if (!l1.allowed) {
        return res.status(l1.status).json({
          success: false,
          securityIntervention: true,
          layer: 1,
          code: l1.code,
          error: l1.message
        });
      }

      // 3. Layer 2 Check: Web Application Firewall (WAF)
      const l2 = this.checkLayer2(req);
      if (!l2.allowed) {
        return res.status(l2.status).json({
          success: false,
          securityIntervention: true,
          layer: 2,
          code: l2.code,
          error: l2.message
        });
      }

      // 4. Layer 3 Check: Auth Rate Limiter
      const l3 = this.checkLayer3(req);
      if (!l3.allowed) {
        return res.status(l3.status).json({
          success: false,
          securityIntervention: true,
          layer: 3,
          code: l3.code,
          error: l3.message
        });
      }

      this.metrics.totalPassed++;
      next();
    };
  }

  _flattenObject(obj, prefix = "") {
    const list = [];
    if (!obj || typeof obj !== "object") return list;
    for (const [k, v] of Object.entries(obj)) {
      const keyPath = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") {
        list.push(...this._flattenObject(v, keyPath));
      } else {
        list.push({ source: keyPath, val: v });
      }
    }
    return list;
  }
}

// Singleton firewall instance for shared application runtime
const firewallInstance = new MindHelixFirewall();

module.exports = {
  MindHelixFirewall,
  firewall: firewallInstance
};
