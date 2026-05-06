require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const {
  encrypt,
  decrypt,
} = require("./utils/encryption");

const app = express();


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

  res.sendFile(__dirname + "/public/index.html");
});


// ======================
// DATABASE CONNECTION
// ======================

const pool = new Pool({

  connectionString: process.env.DATABASE_URL,

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

        email TEXT UNIQUE,

        phone TEXT,

        password TEXT
      )
    `);

    console.log("users2 table created");

  } catch (error) {

    console.log("TABLE ERROR:", error);
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
        error: "All fields required"
      });
    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

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
        email,
        phone,
        password
      )

      VALUES ($1, $2, $3, $4, $5)
      `,

      [
        fullname,
        username,
        email,
        encryptedPhone,
        hashedPassword
      ]
    );

    res.json({

      success: true,
      message: "User registered"
    });

  } catch (error) {

    console.log(error);

    // DUPLICATE EMAIL
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

    const {
      email,
      password
    } = req.body;

    const result = await pool.query(

      `
      SELECT * FROM users2
      WHERE email = $1
      `,

      [email]
    );

    // USER NOT FOUND
    if (result.rows.length === 0) {

      return res.status(400).json({

        success: false,
        error: "User not found"
      });
    }

    const user = result.rows[0];

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(401).json({

        success: false,
        error: "Wrong password"
      });
    }

    // DECRYPT PHONE
    const decryptedPhone =
      decrypt(user.phone);

    res.json({

      success: true,

      user: {

        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: decryptedPhone
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error: "Server error"
    });
  }
});


// ======================
// START SERVER
// ======================

const PORT = 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});