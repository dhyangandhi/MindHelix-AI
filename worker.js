import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const DEFAULT_OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";

const algorithm = "aes-256-cbc";

function getSecretKey(key) {
    return crypto.createHash("sha256").update(key).digest("base64").substring(0, 32);
}

function encrypt(text, key) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, getSecretKey(key), iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    } catch (e) {
        return text;
    }
}

function decrypt(hash, key) {
    try {
        const parts = hash.split(":");
        if (parts.length < 2) return hash;
        const iv = Buffer.from(parts[0], "hex");
        const decipher = crypto.createDecipheriv(algorithm, getSecretKey(key), iv);
        let decrypted = decipher.update(parts[1], "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (e) {
        return hash;
    }
}

function hashEmail(email) {
    return crypto.createHash("sha256").update(email).digest("hex");
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}

function resolveAssetPath(pathname) {
    const clean = pathname.toLowerCase().trim().replace(/^\/+|\/+$/g, "");
    switch (clean) {
        case "":
        case "home":
        case "index":
            return "/home.html";
        case "login":
            return "/login.html";
        case "register":
            return "/register.html";
        case "ai":
            return "/ai.html";
        case "dashboard":
        case "dashbord":
            return "/dashbord.html";
        case "contact":
            return "/Contact.html";
        case "forgot-password":
            return "/forgot-password.html";
        case "reset-password":
            return "/reset-password.html";
        case "components":
        case "shadcn":
            return "/components.html";
        case "forget-success":
            return "/forget succefull.html";
        default:
            return null;
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const method = request.method;

        // Handle CORS Preflight
        if (method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                }
            });
        }

        const dbUrl = (env?.DATABASE_URL || "").trim();
        const encKey = (env?.ENCRYPTION_KEY || "").trim();
        const openrouterKey = (env?.OPENROUTER_API_KEY || "").trim();
        const openrouterModel = (env?.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL).trim();

        const sql = dbUrl ? neon(dbUrl) : null;

        // ============================================
        // API ENDPOINTS (POST)
        // ============================================

        // --- POST /login ---
        if (method === "POST" && (url.pathname === "/login" || url.pathname === "/api/login")) {
            try {
                const body = await request.json().catch(() => ({}));
                const { email, password } = body || {};

                if (!email || !password || typeof email !== "string" || typeof password !== "string") {
                    return jsonResponse({
                        success: false,
                        error: "Please provide both email and password"
                    }, 400);
                }

                if (!sql) {
                    return jsonResponse({
                        success: false,
                        error: "DATABASE_URL is not set in Cloudflare Worker environment variables."
                    }, 500);
                }

                const normalizedEmail = email.trim().toLowerCase();
                const hashedEmail = hashEmail(normalizedEmail);

                const rows = await sql.query(
                    "SELECT fullname, username, email_encrypted, phone, password FROM users2 WHERE email_hash = $1 LIMIT 1",
                    [hashedEmail]
                );

                if (!rows || rows.length === 0) {
                    return jsonResponse({
                        success: false,
                        error: "User not found"
                    }, 400);
                }

                const user = rows[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return jsonResponse({
                        success: false,
                        error: "Wrong password"
                    }, 401);
                }

                const decryptedEmail = user.email_encrypted ? decrypt(user.email_encrypted, encKey) : normalizedEmail;
                const decryptedPhone = user.phone ? decrypt(user.phone, encKey) : "";

                return jsonResponse({
                    success: true,
                    user: {
                        fullname: user.fullname || "",
                        username: user.username || "",
                        email: decryptedEmail,
                        phone: decryptedPhone
                    }
                });
            } catch (err) {
                console.error("Worker Login Error:", err);
                return jsonResponse({
                    success: false,
                    error: "Server error: " + (err.message || "Unknown error")
                }, 500);
            }
        }

        // --- POST /register ---
        if (method === "POST" && (url.pathname === "/register" || url.pathname === "/api/register")) {
            try {
                const body = await request.json().catch(() => ({}));
                const { fullname, username, email, phone, password } = body || {};

                if (!fullname || !username || !email || !phone || !password) {
                    return jsonResponse({
                        success: false,
                        error: "All fields are required"
                    }, 400);
                }

                if (!sql) {
                    return jsonResponse({
                        success: false,
                        error: "DATABASE_URL is not set in Cloudflare Worker environment variables."
                    }, 500);
                }

                const cleanEmail = String(email).trim().toLowerCase();
                const cleanUsername = String(username).trim();
                const cleanFullname = String(fullname).trim();
                const cleanPhone = String(phone).trim();

                const hashedPassword = await bcrypt.hash(password, 10);
                const hashedEmail = hashEmail(cleanEmail);
                const encryptedEmail = encrypt(cleanEmail, encKey);
                const encryptedPhone = encrypt(cleanPhone, encKey);

                await sql.query(
                    `INSERT INTO users2 (fullname, username, email_hash, email_encrypted, phone, password)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [cleanFullname, cleanUsername, hashedEmail, encryptedEmail, encryptedPhone, hashedPassword]
                );

                return jsonResponse({
                    success: true,
                    message: "User registered"
                });
            } catch (err) {
                console.error("Worker Register Error:", err);
                if (err.message && (err.message.includes("unique") || err.message.includes("23505"))) {
                    return jsonResponse({
                        success: false,
                        error: "Email already exists"
                    }, 400);
                }
                return jsonResponse({
                    success: false,
                    error: "Registration failed: " + (err.message || "Unknown error")
                }, 500);
            }
        }

        // --- POST /chat or GET /chat ---
        if (url.pathname === "/chat" || url.pathname === "/api/chat") {
            if (method === "GET") {
                return new Response("OpenRouter Chat API Running (Cloudflare Worker)", {
                    headers: { "Content-Type": "text/plain" }
                });
            }

            try {
                const body = await request.json().catch(() => ({}));
                const message = body.message || (Array.isArray(body.messages) ? body.messages[body.messages.length - 1]?.content : "");

                if (!message) {
                    return jsonResponse({ reply: "Please provide a message" }, 400);
                }

                const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openrouterKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: openrouterModel || "google/gemma-4-26b-a4b-it:free",
                        messages: [
                            { role: "system", content: "You are MindHelix AI, an intelligent, helpful, and concise AI assistant." },
                            { role: "user", content: message }
                        ]
                    })
                });

                const aiData = await aiResponse.json();
                const reply = aiData?.choices?.[0]?.message?.content || "No response generated";

                return jsonResponse({ reply });
            } catch (err) {
                return jsonResponse({
                    reply: "AI service temporarily unavailable",
                    error: err.message
                }, 500);
            }
        }

        // --- GET /test ---
        if (url.pathname === "/test") {
            return new Response("TEST WORKING (Cloudflare Worker Native)", {
                headers: { "Content-Type": "text/plain" }
            });
        }

        // ============================================
        // STATIC ASSET SERVING & CLEAN URL REWRITING
        // ============================================
        if (env?.ASSETS) {
            // Check if clean URL matches a page
            const resolvedPage = resolveAssetPath(url.pathname);
            if (resolvedPage) {
                const assetUrl = new URL(resolvedPage, request.url);
                return env.ASSETS.fetch(new Request(assetUrl, request));
            }

            // Otherwise pass original request to static assets (CSS, JS, images, etc.)
            const response = await env.ASSETS.fetch(request);
            if (response.status !== 404) {
                return response;
            }

            // If 404 on clean URL, fallback to home.html
            const fallbackUrl = new URL("/home.html", request.url);
            return env.ASSETS.fetch(new Request(fallbackUrl, request));
        }

        return new Response("Cloudflare Worker Active (Asset binding pending)", { status: 200 });
    }
};
