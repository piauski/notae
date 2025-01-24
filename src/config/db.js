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
    .catch((error) => {
        console.error("Error during database setup:", error);
    });
