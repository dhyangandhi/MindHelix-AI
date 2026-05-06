const crypto = require("crypto");

const algorithm = "aes-256-cbc";

const secretKey = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest("base64")
  .substring(0, 32);


// ======================
// ENCRYPT FUNCTION
// ======================

function encrypt(text) {

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    secretKey,
    iv
  );

  let encrypted = cipher.update(
    text,
    "utf8",
    "hex"
  );

  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}


// ======================
// DECRYPT FUNCTION
// ======================

function decrypt(hash) {

  const parts = hash.split(":");

  const iv = Buffer.from(
    parts.shift(),
    "hex"
  );

  const encryptedText =
    parts.join(":");

  const decipher =
    crypto.createDecipheriv(
      algorithm,
      secretKey,
      iv
    );

  let decrypted =
    decipher.update(
      encryptedText,
      "hex",
      "utf8"
    );

  decrypted += decipher.final(
    "utf8"
  );

  return decrypted;
}


// ======================
// EXPORT
// ======================

module.exports = {

  encrypt,
  decrypt,
};