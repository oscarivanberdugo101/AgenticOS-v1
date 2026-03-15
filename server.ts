import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import AdmZip from "adm-zip";
import multer from "multer";
import { createRequire } from "module";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Gemini Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Helper: Extract files from LLM response
  function extractFiles(text: string, expectedFiles: string[]): Record<string, string> {
    const results: Record<string, string> = {};
    const pattern = /```[\w]*:([^\s`\n]+)\s*\n([\s\S]*?)```/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const filepath = match[1].trim();
      const content = match[2].trim();
      results[filepath] = content;
    }

    if (Object.keys(results).length === 0) {
      const genericPattern = /```(?:\w+)?\s*\n([\s\S]*?)```/g;
      let i = 0;
      while ((match = genericPattern.exec(text)) !== null && i < expectedFiles.length) {
        results[expectedFiles[i]] = match[1].trim();
        i++;
      }
    }
    return results;
  }

  // API Routes
  app.post("/api/extract-text", upload.single("file"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { originalname, buffer } = req.file;
    const ext = path.extname(originalname).toLowerCase();

    try {
      let content = "";
      if (ext === ".pdf") {
        const data = await pdf(buffer);
        content = data.text;
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } else {
        content = buffer.toString("utf-8");
      }
      res.json({ name: originalname, content, type: ext.slice(1).toUpperCase() });
    } catch (err: any) {
      res.status(500).json({ error: `Error extracting text: ${err.message}` });
    }
  });

  // Telegram Webhook
  app.post("/api/telegram/webhook", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text;

    console.log(`Received Telegram message from ${chatId}: ${text}`);

    // Simple echo or command handling
    if (text === "/start") {
      await sendTelegramMessage(chatId, "Welcome to the AI Agent Control Center. You can send instructions here.");
    } else {
      // Here you would route the message to your AI agents
      await sendTelegramMessage(chatId, `Agent received your instruction: "${text}". Processing...`);
    }

    res.sendStatus(200);
  });

  async function sendTelegramMessage(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN is not set");
      return;
    }

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    }
  }

  app.post("/api/agents/run", async (req, res) => {
    const { prompt, modelType, agentConfig, systemPrompt } = req.body;
    
    try {
      let text = "";

      if (modelType === "local") {
        try {
          const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: agentConfig.id === 'deepseek' ? "deepseek-coder:latest" : (agentConfig.id === 'programador' || agentConfig.id === 'revisor' ? "qwen2.5:7b" : "llama3:latest"),
              prompt: `${systemPrompt}\n\n---\n${prompt}`,
              stream: false,
              options: { temperature: 0.7, num_predict: 4096 }
            })
          });

          if (!response.ok) throw new Error("Ollama not reachable");
          const data = await response.json();
          text = data.response;
        } catch (err) {
          res.status(503).json({ error: "Ollama no disponible localmente." });
          return;
        }
      } else {
        const modelName = agentConfig.model || "gemini-1.5-flash";
        const result = await genAI.models.generateContent({ 
          model: modelName,
          contents: prompt,
          config: { systemInstruction: systemPrompt }
        });
        text = result.text || "";
      }

      const files = extractFiles(text, agentConfig.expectedFiles || []);
      res.json({ text, files });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/validate", async (req, res) => {
    const { files } = req.body;
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-'));
    
    try {
      for (const [filepath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir, filepath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content as string);
      }
      
      // Run tsc on the temp directory
      exec(`npx tsc --noEmit --esModuleInterop --jsx react --moduleResolution node ${path.join(tempDir, '**/*.{ts,tsx}')}`, (error, stdout, stderr) => {
        fs.rm(tempDir, { recursive: true, force: true });
        if (error) {
          res.json({ valid: false, error: stderr || stdout });
        } else {
          res.json({ valid: true });
        }
      });
    } catch (err: any) {
      fs.rm(tempDir, { recursive: true, force: true });
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/export/zip", (req, res) => {
    const { artifacts, projectName } = req.body;
    const zip = new AdmZip();
    Object.entries(artifacts).forEach(([filepath, content]) => {
      zip.addFile(`${projectName}/${filepath}`, Buffer.from(content as string, "utf8"));
    });
    res.set("Content-Type", "application/zip");
    res.set("Content-Disposition", `attachment; filename=${projectName}.zip`);
    res.send(zip.toBuffer());
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
