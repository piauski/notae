import express from "express";
import path from "path";
import { pool } from "../config/db.js";

const app = express();
const PORT = 3000;

const __dirname = import.meta.dirname;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "..", "public")));


// Middleware
app.use(express.json());

// Routes
app.get("/api/notes", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM notes");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).send("Error fetching data");
    }
});

app.delete("/api/notes/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Deleting note with id: ${id}`);
        const result = await pool.query("DELETE FROM notes WHERE id = ?", [id]);
        console.log("Result:", result);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting note: ", error);
        res.status(500).send("Error deleting note");
    }
})

// Fallback route to serve index.html
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

