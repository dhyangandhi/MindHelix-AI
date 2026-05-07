require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const {
  encrypt,
  decrypt,
  hashEmail,
} = require("./utils/encryption");

const app = express();


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
// MIDDLEWARE
// ======================

app.use(cors());

app.use(express.json());

app.use(express.static("public"));


// ======================
// TEST ROUTE
// ======================

app.get("/test", (req, res) => {

  res.send("TEST WORKING");
});


// ======================
// HOME ROUTE
// ======================

app.get("/", (req, res) => {

  res.sendFile(
    __dirname + "/public/index.html"
  );
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
});


// ======================
// CREATE USERS TABLE
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
    } = req.body;

    // VALIDATION

    if (
      !fullname ||
      !username ||
      !email ||
      !phone ||
      !password
    ) {

      return res.status(400).json({

        success: false,
        error:
          "All fields required"
      });
    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // HASH EMAIL

    const hashedEmail =
      hashEmail(email);

    // ENCRYPT EMAIL

    const encryptedEmail =
      encrypt(email);

    // ENCRYPT PHONE

    const encryptedPhone =
      encrypt(phone);

    // INSERT USER

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
        fullname,
        username,
        hashedEmail,
        encryptedEmail,
        encryptedPhone,
        hashedPassword
      ]
    );

    res.json({

      success: true,
      message:
        "User registered"
    });

  } catch (error) {

    console.log(
      "REGISTER ERROR:",
      error
    );

    // DUPLICATE EMAIL

    if (error.code === "23505") {

      return res.status(400).json({

        success: false,
        error:
          "Email already exists"
      });
    }

    res.status(500).json({

      success: false,
      error:
        "Server error"
    });
  }
});


// ======================
// LOGIN ROUTE
// ======================

app.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // HASH EMAIL

    const hashedEmail =
      hashEmail(email);

    // FIND USER

    const result =
      await pool.query(

        `
        SELECT * FROM users2
        WHERE email_hash = $1
        `,

        [hashedEmail]
      );

    // USER NOT FOUND

    if (
      result.rows.length === 0
    ) {

      return res.status(400).json({

        success: false,
        error:
          "User not found"
      });
    }

    const user =
      result.rows[0];

    // CHECK PASSWORD

    const isMatch =
      await bcrypt.compare(

        password,
        user.password
      );

    if (!isMatch) {

      return res.status(401).json({

        success: false,
        error:
          "Wrong password"
      });
    }

    // DECRYPT DATA

    const decryptedEmail =
      decrypt(
        user.email_encrypted
      );

    const decryptedPhone =
      decrypt(user.phone);

    res.json({

      success: true,

      user: {

        fullname:
          user.fullname,

        username:
          user.username,

        email:
          decryptedEmail,

        phone:
          decryptedPhone
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error:
        "Server error"
    });
  }
});


// ======================
// FORGOT PASSWORD ROUTE
// ======================

app.post(
  "/forgot-password",

  async (req, res) => {

    try {

      const { email } =
        req.body;

      // HASH EMAIL

      const hashedEmail =
        hashEmail(email);

      // FIND USER

      const result =
        await pool.query(

          `
          SELECT * FROM users2
          WHERE email_hash = $1
          `,

          [hashedEmail]
        );

      // USER NOT FOUND

      if (
        result.rows.length === 0
      ) {

        return res.status(400).json({

          success: false,
          error:
            "Email not found"
        });
      }

      // CREATE TOKEN

      const token =
        uuidv4();

      // TOKEN EXPIRY

      const expiry =
        Date.now() +
        1000 * 60 * 15;

      // SAVE TOKEN

      await pool.query(

        `
        UPDATE users2
        SET
        reset_token = $1,
        reset_token_expiry = $2
        WHERE email_hash = $3
        `,

        [
          token,
          expiry,
          hashedEmail
        ]
      );

      // RESET LINK

      const resetLink =

        `http://localhost:3000/reset-password.html?token=${token}`;

      // SEND EMAIL

      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to: email,

        subject:
          "Password Reset",

        html: `

          <h2>
            Password Reset
          </h2>

          <p>
            Click below link
            to reset password
          </p>

          <a href="${resetLink}">
            Reset Password
          </a>
        `,
      });

      res.json({

        success: true,

        message:
          "Reset email sent"
      });

    } catch (error) {

      console.log(

        "FORGOT PASSWORD ERROR:",

        error
      );

      res.status(500).json({

        success: false,
        error:
          "Server error"
      });
    }
  }
);


// ======================
// RESET PASSWORD ROUTE
// ======================

app.post(
  "/reset-password",

  async (req, res) => {

    try {

      const {
        token,
        password
      } = req.body;

      // FIND TOKEN

      const result =
        await pool.query(

          `
          SELECT * FROM users2
          WHERE reset_token = $1
          `,

          [token]
        );

      // INVALID TOKEN

      if (
        result.rows.length === 0
      ) {

        return res.status(400).json({

          success: false,
          error:
            "Invalid token"
        });
      }

      const user =
        result.rows[0];

      // TOKEN EXPIRED

      if (

        Date.now() >

        user.reset_token_expiry

      ) {

        return res.status(400).json({

          success: false,
          error:
            "Token expired"
        });
      }

      // HASH PASSWORD

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // UPDATE PASSWORD

      await pool.query(

        `
        UPDATE users2
        SET
        password = $1,
        reset_token = NULL,
        reset_token_expiry = NULL
        WHERE id = $2
        `,

        [
          hashedPassword,
          user.id
        ]
      );

      res.json({

        success: true,

        message:
          "Password updated"
      });

    } catch (error) {

      console.log(

        "RESET PASSWORD ERROR:",

        error
      );

      res.status(500).json({

        success: false,
        error:
          "Server error"
      });
    }
  }
);


// ======================
// START SERVER
// ======================

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(

    `Server running on port ${PORT}`
  );
});