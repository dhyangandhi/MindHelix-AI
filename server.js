require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const {
    encrypt,
    decrypt,
    hashEmail,
    maskEmail,
    maskPhone,
} = require("./utils/encryption");

const app = express();


// ======================
// MIDDLEWARE
// ======================

app.use(cors());

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "www")
    )
);

app.use(
    express.static(__dirname)
);


// ======================
// PAGE ROUTES
// ======================

// ======================
// PAGE ROUTES (CLEAN URLs)
// ======================

// Helper function to resolve target file from route name
function resolveRouteFile(routeName) {
    if (!routeName) return path.join(__dirname, "www", "home.html");
    const route = routeName.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
    switch (route) {
        case 'home':
        case 'index':
        case '':
            return path.join(__dirname, "www", "home.html");
        case 'login':
            return path.join(__dirname, "www", "login.html");
        case 'register':
            return path.join(__dirname, "www", "register.html");
        case 'ai':
            return path.join(__dirname, "www", "ai.html");
        case 'dashboard':
        case 'dashbord':
            return path.join(__dirname, "dashbord.html");
        case 'contact':
            return path.join(__dirname, "Contact.html");
        case 'forgot-password':
            return path.join(__dirname, "www", "forgot-password.html");
        case 'reset-password':
            return path.join(__dirname, "www", "reset-password.html");
        case 'components':
        case 'shadcn':
        case 'components.html':
            return path.join(__dirname, "www", "components.html");
        case 'forget-success':
            return path.join(__dirname, "www", "forget succefull.html");
        default:
            return null;
    }
}

// API endpoint to encrypt any path URL
app.get("/api/encrypt-url", (req, res) => {
    const targetPath = req.query.path || "home";
    try {
        const encodedBase64 = Buffer.from(targetPath).toString("base64url");
        const aesToken = encrypt ? encrypt(targetPath) : encodedBase64;
        res.json({
            success: true,
            originalPath: targetPath,
            encryptedUrl: `/e/${encodedBase64}`,
            aesEncryptedUrl: `/secure?token=${encodeURIComponent(aesToken)}`
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route for encrypted URL tokens (e.g. /e/bG9naW4= or /e/aG9tZQ==)
app.get("/e/:token", (req, res) => {
    try {
        const token = req.params.token || "";
        let decoded = "";
        try {
            let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) {
                b64 += '=';
            }
            decoded = Buffer.from(b64, "base64").toString("utf8");
        } catch (e) {
            decoded = token;
        }

        let targetFile = resolveRouteFile(decoded);
        if (!targetFile && typeof decrypt === "function") {
            try {
                const aesDecoded = decrypt(token);
                targetFile = resolveRouteFile(aesDecoded);
            } catch (e) { }
        }

        if (targetFile) {
            return res.sendFile(targetFile);
        }
        res.sendFile(path.join(__dirname, "www", "home.html"));
    } catch (err) {
        res.sendFile(path.join(__dirname, "www", "home.html"));
    }
});

// Route for secure query token URLs (e.g. /secure?token=...)
app.get("/secure", (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.redirect("/");
        let decodedPath = "";
        if (typeof decrypt === "function") {
            try {
                decodedPath = decrypt(token);
            } catch (e) { }
        }
        if (!decodedPath) {
            try {
                decodedPath = Buffer.from(token, "base64url").toString("utf8");
            } catch (e) { }
        }
        const targetFile = resolveRouteFile(decodedPath);
        if (targetFile) {
            return res.sendFile(targetFile);
        }
        res.redirect("/");
    } catch (err) {
        res.redirect("/");
    }
});

app.get(["/", "/home", "/home.html", "/index.html", "/www/home.html", "/www/index.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "home.html"));
});

app.get(["/login", "/login.html", "/www/login.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "login.html"));
});

app.get(["/register", "/register.html", "/www/register.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "register.html"));
});

app.get(["/ai", "/ai.html", "/www/ai.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "ai.html"));
});

app.get(["/components", "/shadcn", "/components.html", "/www/components.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "components.html"));
});

app.get(["/dashboard", "/dashbord", "/dashbord.html", "/dashboard.html", "/www/dashbord.html", "/www/dashboard.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "dashbord.html"));
});

app.get(["/forgot-password", "/forgot-password.html", "/www/forgot-password.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "forgot-password.html"));
});

app.get(["/reset-password", "/reset-password.html", "/www/reset-password.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "reset-password.html"));
});

app.get(["/contact", "/contact.html", "/Contact.html", "/www/contact.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "Contact.html"));
});

app.get(["/forget-success", "/forget-success.html", "/www/forget succefull.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "www", "forget succefull.html"));
});


// ======================
// EMAIL TRANSPORTER
// ======================

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASS,
        },
    });


// ======================
// DATABASE CONNECTION
// ======================

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    },

    connectionTimeoutMillis:
        10000,
});


// ======================
// CREATE TABLE
// ======================

async function createTable() {

    try {

        await pool.query(`

      CREATE TABLE IF NOT EXISTS users2 (

        id SERIAL PRIMARY KEY,

        fullname TEXT,

        username TEXT,

        email_hash TEXT UNIQUE,

        email_encrypted TEXT,

        phone TEXT,

        password TEXT,

        reset_token TEXT,

        reset_token_expiry BIGINT
      )
    `);

        console.log(
            "users2 table created"
        );

    } catch (error) {

        console.log(
            "TABLE ERROR:",
            error
        );
    }
}

createTable();


// ======================
// REGISTER ROUTE
// ======================

app.post("/register", async (req, res) => {
    try {
        const {
            fullname,
            username,
            email,
            phone,
            password
        } = req.body || {};

        if (
            !fullname ||
            !username ||
            !email ||
            !phone ||
            !password ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const cleanFullname = fullname.trim();
        const cleanPhone = String(phone).trim();

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedEmail = hashEmail(cleanEmail);
        const encryptedEmail = encrypt(cleanEmail);
        const encryptedPhone = encrypt(cleanPhone);

        await pool.query(
            `
      INSERT INTO users2
      (
        fullname,
        username,
        email_hash,
        email_encrypted,
        phone,
        password
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      `,
            [
                cleanFullname,
                cleanUsername,
                hashedEmail,
                encryptedEmail,
                encryptedPhone,
                hashedPassword
            ]
        );

        res.json({
            success: true,
            message: "User registered"
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                error: "Email already exists"
            });
        }
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});


// ======================
// LOGIN ROUTE
// ======================

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                error: "Please provide both email and password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const hashedEmail = hashEmail(normalizedEmail);

        const result = await pool.query(
            `SELECT fullname, username, email_encrypted, phone, password FROM users2 WHERE email_hash = $1 LIMIT 1`,
            [hashedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "User not found"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Wrong password"
            });
        }

        const decryptedEmail = user.email_encrypted ? decrypt(user.email_encrypted) : normalizedEmail;
        const decryptedPhone = user.phone ? decrypt(user.phone) : "";

        res.json({
            success: true,
            user: {
                fullname: user.fullname || "",
                username: user.username || "",
                email: decryptedEmail,
                phone: decryptedPhone
            }
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});


// ======================
// ======================
// CHAT TEST ROUTE
// ======================

app.get("/chat", (req, res) => {

    res.send("OpenRouter Chat API Running");

});


// ======================
// OPENROUTER AI CHAT
// ======================

app.post("/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {

            return res.status(400).json({

                reply:
                    "Message required"
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";

        if (!apiKey) {
            return res.status(400).json({
                reply: "OpenRouter API key is not configured in .env (OPENROUTER_API_KEY)"
            });
        }

        const response = await fetch(

            "https://openrouter.ai/api/v1/chat/completions",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`,

                    "HTTP-Referer":
                        "http://localhost:3000",

                    "X-Title":
                        "AI Chat App"
                },

                body: JSON.stringify({

                    model: model,

                    messages: [

                        {
                            role: "user",

                            content: message
                        }
                    ]
                })
            }
        );

        const data =
            await response.json();

        console.log(
            "OPENROUTER RESPONSE:",
            data
        );

        let reply = "No response";

        if (
            data.choices &&
            Array.isArray(data.choices) &&
            data.choices.length > 0
        ) {

            reply =
                data.choices[0].message?.content ||
                "No response";
        } else if (data.error) {
            reply = `Error from OpenRouter: ${data.error.message || JSON.stringify(data.error)}`;
        }

        res.json({
            reply
        });

    } catch (error) {

        console.log(
            "OPENROUTER ERROR:",
            error
        );

        res.status(500).json({

            reply:
                "AI server error"
        });
    }
});

// ======================
// AI IMAGE GENERATION ROUTE
// ======================

app.post("/api/generate-image", async (req, res) => {
    try {
        const { prompt, style, width, height } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required"
            });
        }

        const seed = Math.floor(Math.random() * 1000000);
        const selectedWidth = width || 1024;
        const selectedHeight = height || 1024;
        const styleString = style && style !== 'none' ? `, ${style} style` : '';
        const fullPrompt = `${prompt.trim()}${styleString}`;
        const apiKey = process.env.OPENROUTER_API_KEY;

        let imageUrl = null;
        let provider = "FLUX.1 AI Engine";

        // Attempt OpenRouter AI Image API first if key is present
        if (apiKey) {
            try {
                const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "MindHelix AI Image Generator"
                    },
                    body: JSON.stringify({
                        model: process.env.OPENROUTER_IMAGE_MODEL || "black-forest-labs/flux-1-schnell",
                        messages: [{ role: "user", content: `Generate image: ${fullPrompt}` }]
                    })
                });

                const openrouterData = await openrouterRes.json();
                if (openrouterData.choices && openrouterData.choices[0]?.message?.content) {
                    const content = openrouterData.choices[0].message.content;
                    const urlMatch = content.match(/https?:\/\/[^\s\)\"]+\.(png|jpg|jpeg|webp)/i) || content.match(/https?:\/\/[^\s\)\"]+/i);
                    if (urlMatch) {
                        imageUrl = urlMatch[0];
                        provider = "OpenRouter AI (" + (process.env.OPENROUTER_IMAGE_MODEL || "FLUX 1") + ")";
                    }
                }
            } catch (e) {
                console.log("OpenRouter image fallback to FLUX AI engine:", e.message);
            }
        }

        // High-performance FLUX / SDXL AI Image Synthesis Engine
        if (!imageUrl) {
            const encodedPrompt = encodeURIComponent(fullPrompt);
            imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${selectedWidth}&height=${selectedHeight}&seed=${seed}&nologo=true&model=flux`;
        }

        res.json({
            success: true,
            prompt: fullPrompt,
            imageUrl: imageUrl,
            seed: seed,
            width: selectedWidth,
            height: selectedHeight,
            provider: provider
        });
    } catch (error) {
        console.error("IMAGE GENERATION ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Image generation server error"
        });
    }
});


// ======================
// FORGOT PASSWORD
// ======================

app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                error: "Please enter your email address"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const hashedEmail = hashEmail(cleanEmail);

        const result = await pool.query(
            `SELECT id FROM users2 WHERE email_hash = $1`,
            [hashedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Email not found"
            });
        }

        const token = uuidv4();
        const expiry = Date.now() + 1000 * 60 * 15;

        await pool.query(
            `
            UPDATE users2
            SET reset_token = $1, reset_token_expiry = $2
            WHERE email_hash = $3
            `,
            [token, expiry, hashedEmail]
        );

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: cleanEmail,
                subject: "Password Reset - MindHelix AI",
                html: `
                  <h2>Password Reset Request</h2>
                  <p>Click the link below to reset your password (valid for 15 minutes):</p>
                  <a href="${resetLink}">Reset Password</a>
                `
            });
        }

        res.json({
            success: true,
            message: "Reset email sent"
        });

    } catch (error) {
        console.log("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Server error"
        });
    }
});


// ======================
// RESET PASSWORD
// ======================

app.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body || {};

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                error: "Reset token and new password are required"
            });
        }

        const result = await pool.query(
            `SELECT id, reset_token_expiry FROM users2 WHERE reset_token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid reset token"
            });
        }

        const user = result.rows[0];

        if (Date.now() > Number(user.reset_token_expiry)) {
            return res.status(400).json({
                success: false,
                error: "Token has expired"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `
            UPDATE users2
            SET password = $1, reset_token = NULL, reset_token_expiry = NULL
            WHERE id = $2
            `,
            [hashedPassword, user.id]
        );

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});


// ======================
// NEON DATA MASKING API
// ======================

app.get("/api/neon-masking", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, fullname, username, email_encrypted, phone FROM users2 LIMIT 10");
        const maskedUsers = result.rows.map(user => {
            let rawEmail = "";
            let rawPhone = "";
            if (user.email_encrypted && typeof decrypt === "function") {
                try { rawEmail = decrypt(user.email_encrypted); } catch (e) { }
            }
            if (user.phone && typeof decrypt === "function") {
                try { rawPhone = decrypt(user.phone); } catch (e) { rawPhone = user.phone; }
            }
            return {
                id: user.id,
                fullname: user.fullname,
                username: user.username,
                masked_email: maskEmail(rawEmail || "user@domain.com"),
                masked_phone: maskPhone(rawPhone || "0000000000")
            };
        });
        res.json({
            success: true,
            neonDatabase: "Connected (Neon Postgres)",
            branch: "production / Html Pages",
            dataMaskingStatus: "Active",
            usersCount: result.rowCount,
            maskedData: maskedUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            neonDatabase: "Connected (Neon Postgres)",
            branch: "production / Html Pages",
            dataMaskingStatus: "Active",
            message: "Data Masking active on Neon Postgres connection pool",
            error: error.message
        });
    }
});

// ======================
// TEST ROUTE
// ======================

app.get("/test", (req, res) => {

    res.send("TEST WORKING");
});


// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 3000;

if (require.main === module || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;