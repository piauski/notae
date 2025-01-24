/**
 * Notes Data Model
 * ----------------
 * File: notes.js
 * 
 * Provides functions for creating, retrieving, and managing notes in
 * the database.
 *
 * Created: 2025-01-24
 * Updated: 2025-01-24
 * Author: Patryk Pisarski
 */

import { v4 as uuidv4 } from "uuid";

import { pool } from "../config/db.js";

/**
 * Creates a new note and retrieves the created note by its ID.
 *
 * @param {string} title - The title of the note.
 * @param {string} content - The content of the note.
 * @returns {Promise<Object>} The created note.
 * @throws {Error} If an error occurs during note creation or retrieval.
 */
export async function createNote(title, content) {
    const noteId = uuidv4();
    const insertNoteQuery = `
INSERT INTO notes (id, title, content)
VALUES (?, ?, ?)
`;
    return pool.execute(insertNoteQuery, [noteId, title, content])
        .then(([result]) => {
            console.log("Note saved successfully: ", result);
            return getNoteById(noteId);
        });
}

/**
 * Retrieves a note by ID. Returns a note object which contains fields:
 *     const note = { id, title, content, created_at, updated_at };
 *
 * @param {string} noteId The ID of the note to get.
 * @returns {Promise<Object>} The retrieved note.
 * @throws {Error} If an error occurs during retrieval.
 *                 This error must be handled by the caller.
 */
export async function getNoteById(noteId) {
    const getNoteQuery = `
SELECT *
FROM notes
WHERE id = ?
`;
    // This assumes only one note can have one uuid. Should be true.
    return pool.execute(getNoteQuery, [noteId])
        .then(([noteRows]) => {
            console.log(`Fetched note by id: ${noteId}`);
            return noteRows[0];
        });
}

/**
 * Retrieves a list of all notes from the database.
 *
 * @async
 * @returns {Promise<Array<Object>>} A promise resolving to an array of notes.
 * @throws {Error} If an error occurs while executing the database query.
 *                 This error must be handled by the caller.
 */
export async function getAllNotes() {
    return pool.query("SELECT * FROM notes");
}

/**
 * Updates a note by its ID with new content and retrieves the updated note.
 *
 * @param {string} noteId - The ID of the note to update.
 * @param {string} newContent - The new content of the note.
 * @returns {Promise<Object>} The updated note.
 * @throws {Error} If an error occurs during note update or retrieval.
 *                 This error must be handled by the caller.
 */
export async function updateNoteByIdWithContent(noteId, newContent) {
    // Title is always the first line, stripped, of the content of the note.
    const newTitle = newContent
            .split("\n")[0]
            .replace(/^#+\s*/, "")
          .trim();
    
    const updateNoteQuery = `
      UPDATE notes
      SET title = ?, content = ?, updated_at = NOW()
      WHERE id = ?
    `;
    return pool.execute(updateNoteQuery, [newTitle, newContent, noteId])
        .then(([result])=> {
            console.log(`Updated note ${noteId} with title: "${newTitle}" and content "${newContent}"`);
            return getNoteById(noteId);
        });
}

/**
 * Deletes a note by its ID.
 *
 * @param {string} noteId The ID of the note to delete.
 * @returns {Promise<Object>} The result of the deletion operation.
 * @throws {Error} If an error occurs during the deletion operation.
 *                 This error must be handled by the caller.
 */
export async function deleteNoteById(noteId) {
    return pool.query("DELETE FROM notes WHERE id = ?", [noteId]);
}
