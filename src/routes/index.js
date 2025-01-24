/**
 * Notes API Routes
 * ----------------
 * File: index.js
 *
 * This file defines API routes for managing notes, including
 * creating, reading, updating, and deleting notes.
 *
 * Created: 2025-01-24
 * Updated: 2025-01-24
 * Author: Patryk Pisarski
 */

import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { pool } from "../config/db.js";
import * as notes from "../models/notes.js";

const app = express();
const PORT = 3000;

const __dirname = import.meta.dirname;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Middleware
app.use(express.json());

// -- Routes -------------------------------------------------------------------

/**
 * Retrieves a list of all notes.
 *
 * @route GET /api/notes
 * @returns {200 OK} A JSON array of notes.
 * @throws {500 Internal Server Error} If an error occurs while fetching notes.
 */
app.get("/api/notes", async (_req, res) => {
    try {
        const [rows] = await notes.getAllNotes();
        res.json(rows);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).send("Error fetching data");
    }
});

/**
 * Creates a new note.
 *
 * @route POST /api/notes/new
 * @param {string} content - The content of the note.
 * @returns {201 Created} The created note.
 * @throws {500 Internal Server Error} If an error occurs during creation.
 */

app.post("/api/notes/new", async (req, res) => {
    try {
        const { content } = req.body;
        const title = content
            .split("\n")[0]
            .replace(/^#+\s*/, "")
            .trim();
        const createdNote = await notes.createNote(title, content);
        res.status(201).json(createdNote);
    } catch (error) {
        console.error("Error creating note: ", error);
        res.status(500).send("Error creating note");
    }
});

/**
 * Retrieves a note by its ID.
 *
 * @route GET /api/notes/:id
 * @param {string} id - The ID of the note to retrieve.
 * @returns {200 OK} The retrieved note.
 * @throws {500 Internal Server Error} If an error occurs during retrieval.
 */
app.get("/api/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await notes.getNoteById(noteId);
        res.json(note);
    } catch (error) {
        console.error("Error fetching note: ", error);
        res.status(500).send("Error fetching note");
    }
});

/**
 * Updates a note by its ID and content.
 *
 * @route PATCH /api/notes/:id
 * @param {string} id - The ID of the note to update.
 * @param {string} content - The new content of the note.
 * @returns {200 OK} The updated note.
 * @throws {500 Internal Server Error} If an error occurs during update.
 */
app.patch("/api/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const newContent = req.body.content;
        const note = await notes.updateNoteByIdWithContent(noteId, newContent);
        res.json(note);
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).send("Error updating note");
    }
});

/**
 * Deletes a note by its ID.
 *
 * @route DELETE /api/notes/:id
 * @param {string} id - The ID of the note to delete.
 * @returns {204 No Content} If the note is deleted successfully.
 * @throws {500 Internal Server Error} If an error occurs during deletion.
 */
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Deleting note with id: ${id}`);
        await notes.deleteNoteById(id);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting note: ", error);
        res.status(500).send("Error deleting note");
    }
});


// Fallback route to serve index.html
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// -- END...Routes -------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
