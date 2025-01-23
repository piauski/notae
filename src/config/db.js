import * as mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "mynotes";

// Create a connection pool
export const pool = mysql
    .createPool({
        host: "localhost",
        user: "app_user",
        password: "Password123!",
    })
    .promise();

const createDatabase = async () => {
    try {
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
        console.log("Database created or already exists!");
    } catch (error) {
        console.error("Error creating database: ", error);
    }
};

const setDefaultDatabase = async (database) => {
    try {
        await pool.query(`USE ${database}`);
        console.log(`Switched to database: ${database}`);
    } catch (error) {
        console.error("Error switching database: ", error);
    }
};

const createTable = async () => {
    try {
        const [result] = await pool.execute(`
CREATE TABLE IF NOT EXISTS notes (
id CHAR(36) PRIMARY KEY, -- UUID as a 36-character string
title VARCHAR(255),
content TEXT,
file_path VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`);
        console.log("Table created successfully: ", result);
    } catch (error) {
        console.error("Error creating database: ", error);
    }
};

createDatabase()
    .then(() => setDefaultDatabase(DB_NAME))
    .then(() => createTable())
    .then(async () => {
        const noteId = uuidv4();
        const insertNoteQuery = `
INSERT INTO notes (id, title, content, file_path)
VALUES (?, ?, ?, ?)
`;
        try {
            const [result] = await pool.execute(insertNoteQuery, [
                noteId,
                "My note",
                "This is the content of my first note",
                "/path/to/file.txt",
            ]);
            console.log("Note saved successfully: ", result);
        } catch (error) {
            console.error("Error saving note: ", error);
        }
    })
    .catch((error) => {
        console.error("Error during database setup:", error);
    });
