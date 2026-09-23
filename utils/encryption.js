const crypto = require("crypto");

const algorithm = "aes-256-cbc";

const encryptionKey = process.env.ENCRYPTION_KEY || "html-pages-default-32-byte-secret-key-fallback!!";

const secretKey = crypto
  .createHash("sha256")
  .update(String(encryptionKey))
  .digest("base64")
  .substring(0, 32);


// ======================
// ENCRYPT FUNCTION
// ======================

function encrypt(text) {
  if (!text) return "";
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      secretKey,
      iv
    );

    let encrypted = cipher.update(
      String(text),
      "utf8",
      "hex"
    );

    encrypted += cipher.final("hex");

    return (
      iv.toString("hex") +
      ":" +
      encrypted
    );
  } catch (err) {
    console.error("Encryption error:", err.message);
    return "";
  }
}


// ======================
// DECRYPT FUNCTION
// ======================

function decrypt(hash) {
  if (!hash || typeof hash !== "string" || !hash.includes(":")) return "";
  try {
    const parts = hash.split(":");
    const iv = Buffer.from(
      parts.shift(),
      "hex"
    );

    const encryptedText = parts.join(":");

    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      iv
    );

    let decrypted = decipher.update(
      encryptedText,
      "hex",
      "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    return "";
  }
}


// ======================
// HASH EMAIL FUNCTION
// ======================

function hashEmail(email) {
  if (!email || typeof email !== "string") return "";
  try {
    return crypto
      .createHash("sha256")
      .update(email.toLowerCase())
      .digest("hex");
  } catch (err) {
    console.error("Hash email error:", err.message);
    return "";
  }
}


// ======================
// DATA MASKING FUNCTIONS (Neon DB Masking)
// ======================

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return local.charAt(0) + '***@' + domain;
  return local.substring(0, 2) + '***' + local.slice(-1) + '@' + domain;
}

function maskPhone(phone) {
  if (!phone) return '***';
  const str = String(phone).replace(/\s+/g, '');
  if (str.length <= 4) return '****';
  return str.substring(0, 3) + '****' + str.slice(-3);
}

// ======================
// EXPORT
// ======================

module.exports = {
  encrypt,
  decrypt,
  hashEmail,
  maskEmail,
  maskPhone,
};