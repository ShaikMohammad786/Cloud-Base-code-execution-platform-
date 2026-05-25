import express from "express";
import dotenv from "dotenv"
import cors from "cors";
dotenv.config()
import { copyS3Folder } from "./aws";
import { verifyJwt, AuthRequest } from "./middleware/verify-jwt";

const app = express();
app.use(express.json());
app.use(cors())

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';

app.post("/project", verifyJwt, async (req: AuthRequest, res) => {
    const { replId, language } = req.body;

    if (!replId) {
        res.status(400).send("Bad request");
        return;
    }

    await copyS3Folder(`base/${language}`, `code/${replId}`);

    // Register project with auth-service
    try {
        const authHeader = req.headers.authorization;
        await fetch(`${AUTH_SERVICE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || '',
            },
            body: JSON.stringify({ replId, name: replId, language }),
        });
    } catch (err) {
        console.error('Failed to register project with auth-service:', err);
    }

    res.send("Project created");
});

// Clone from GitHub
app.post("/clone", verifyJwt, async (req: AuthRequest, res) => {
    const { repoUrl, replId } = req.body;

    if (!repoUrl || !replId) {
        res.status(400).send("repoUrl and replId are required");
        return;
    }

    // Register project with auth-service
    try {
        const authHeader = req.headers.authorization;
        await fetch(`${AUTH_SERVICE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || '',
            },
            body: JSON.stringify({ replId, name: replId, language: 'node-js' }),
        });
    } catch (err) {
        console.error('Failed to register project with auth-service:', err);
    }

    res.json({ success: true, message: "Project registered. Use git clone in the terminal." });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`listening on *:${port}`);
});
