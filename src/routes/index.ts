import express from "express";
import { helloRouter } from "../router";
import { pool } from "../config/db";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/api/users", async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query("SELECT * FROM notes");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching data");
    }
});

app.get("/", (_req, res): void => {
    res.send("Welcome to the Hello World App!");
});

app.use("/api", helloRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
