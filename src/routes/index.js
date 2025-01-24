import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

// Delete a note by id
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Deleting note with id: ${id}`);
        const [result] = await pool.query("DELETE FROM notes WHERE id = ?", [
            id,
        ]);
        console.log("Result:", result);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting note: ", error);
        res.status(500).send("Error deleting note");
    }
});

// Create a new note
app.post("/api/notes/new", async (req, res) => {
    try {
        const { content } = req.body;
        const title = content
            .split("\n")[0]
            .replace(/^#+\s*/, "")
            .trim();
        const noteId = uuidv4();
        const insertNoteQuery = `
INSERT INTO notes (id, title, content)
VALUES (?, ?, ?)
`;
        try {
            const [result] = await pool.execute(insertNoteQuery, [
                noteId,
                title,
                content,
            ]);
            console.log("Note saved successfully: ", result);

            const getNoteQuery = `
SELECT *
FROM notes
WHERE id = ?
`;
            const [noteRows] = await pool.execute(getNoteQuery, [noteId]);
            const createdNote = noteRows[0];

            res.status(201).json(createdNote);
        } catch (error) {
            console.error("Error saving note: ", error);
        }
    } catch (error) {
        console.error("Error creating note: ", error);
        res.status(500).send("Error creating note");
    }
});

// Fetch a note by id
app.get("/api/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        console.log("Getting note by id: ", noteId);
        const selectNoteQuery = `
SELECT *
FROM notes
WHERE id = ?
`;
        const [noteRows] = await pool.execute(selectNoteQuery, [noteId]);

        const note = noteRows[0];
        console.log(note);
        res.json(note);
    } catch (error) {
        console.error("Error fetching note: ", error);
        res.status(500).send("Error fetching note");
    }
});

// Update a note by id and content.
app.patch("/api/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const newContent = req.body.content;
        const newTitle = newContent
            .split("\n")[0]
            .replace(/^#+\s*/, "")
            .trim();

        console.log(
            `Updating NoteID: ${noteId} with title: '${newTitle}' and content: '${newContent}'`,
        );
        const updateNoteQuery = `
      UPDATE notes
      SET title = ?, content = ?, updated_at = NOW()
      WHERE id = ?
    `;

        await pool.execute(updateNoteQuery, [newTitle, newContent, noteId]);

        const getNoteQuery = `
SELECT *
FROM notes
WHERE id = ?
`;
        const [noteRows] = await pool.execute(getNoteQuery, [noteId]);
        const note = noteRows[0];
        console.log("Updated note retrieved: ", note);
        res.json(note);
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).send("Error updating note");
    }
});

// Fallback route to serve index.html
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
