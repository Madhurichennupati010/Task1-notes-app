require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err);
        return;
    }

    console.log("✅ Connected to MySQL");

    const createTable = `
        CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTable, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("✅ Notes table ready");
        }
    });
});

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===========================
// GET ALL NOTES
// ===========================
app.get("/api/notes", (req, res) => {

    db.query(
        "SELECT * FROM notes ORDER BY id DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );

});


// ===========================
// GET SINGLE NOTE
// ===========================
app.get("/api/notes/:id", (req, res) => {

    db.query(
        "SELECT * FROM notes WHERE id=?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Note Not Found"
                });
            }

            res.json(results[0]);

        }
    );

});


// ===========================
// CREATE NOTE
// ===========================
app.post("/api/notes", (req, res) => {

    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and Content are required"
        });
    }

    db.query(
        "INSERT INTO notes(title,content) VALUES(?,?)",
        [title, content],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Note Created Successfully",
                id: result.insertId
            });

        }
    );

});


// ===========================
// UPDATE NOTE
// ===========================
app.put("/api/notes/:id", (req, res) => {

    const { title, content } = req.body;

    db.query(
        "UPDATE notes SET title=?, content=? WHERE id=?",
        [title, content, req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Note Updated Successfully"
            });

        }
    );

});


// ===========================
// DELETE NOTE
// ===========================
app.delete("/api/notes/:id", (req, res) => {

    db.query(
        "DELETE FROM notes WHERE id=?",
        [req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Note Deleted Successfully"
            });

        }
    );

});


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});