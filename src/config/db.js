/**
 * Database Connection And Setup
 * -----------------------------
 * File: db.js
 * 
 * This file defines the database connection pool and setup functions
 * for the application.
 *
 * Created: 2025-01-17
 * Updated: 2025-01-24
 * Author: Patryk Pisarski
 */

import * as mysql from "mysql2";

const DB_NAME = "notes";

// Create a connection pool
export const pool = mysql
    .createPool({
        host: "localhost",
        user: "app_user",
        password: "Password123!",
    })
    .promise();

/**
 * Creates a new database with the specified name.
 *
 * If the database already exists, this function will not throw an error.
 *
 * @async
 * @param {string} databaseName - The name of the database to create.
 * @throws {Error} If an error occurs while creating the database.
 * @returns {Promise<void>} A promise that resolves when the database creation is complete.
 */
const createDatabase = async (databaseName) => {
    try {
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
        console.log("Database created or already exists!");
    } catch (error) {
        console.error("Error creating database: ", error);
    }
};

/**
 * Switches to the specified database.
 *
 * @async
 * @param {string} databaseName - The name of the database to switch to.
 * @throws {Error} If an error occurs while switching databases.
 * @returns {Promise<void>} A promise that resolves when the database switch is complete.
 */
const setDefaultDatabase = async (databaseName) => {
    try {
        await pool.query(`USE ${databaseName}`);
        console.log(`Switched to database: ${databaseName}`);
    } catch (error) {
        console.error("Error switching database: ", error);
    }
};

/**
 * Creates a new table named 'notes' with the specified schema.
 *
 * The table has fields:
 * - id (primary key): a 36-character string UUID -- import { v4 as uuidv4 } from "uuid";
 * - title: variable-length string -- The note's title.
 * - content: text -- The note's content.
 * - created_at: timestamp of creation date
 * - updated_at: timestamp of latest update date
 *
 * Will not error if table already exists.
 *
 * @async
 * @throws {Error} If an error occurs while creating the table.
 * @returns {Promise<void>} A promise that resolves when the table creation is complete.
 */
const createTable = async () => {
    try {
        const [result] = await pool.execute(`
CREATE TABLE IF NOT EXISTS notes (
id CHAR(36) PRIMARY KEY, -- UUID as a 36-character string
title VARCHAR(255),
content TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`);
        console.log("Table created successfully: ", result);
    } catch (error) {
        console.error("Error creating database: ", error);
    }
};


// Database setup on server start
createDatabase(DB_NAME)
    .then(() => setDefaultDatabase(DB_NAME))
    .then(() => createTable())
    .catch((error) => {
        console.error("Error during database setup:", error);
    });
