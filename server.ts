import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import multer from "multer";
import { createRequire } from "module";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";
import * as prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Helper: Extract files from LLM response
  function extractFiles(text: string, expectedFiles: string[]): Record<string, string> {
    const results: Record<string, string> = {};
    
    // Pattern 1: ```lang:path/to/file\ncontent\n```
    const pattern1 = /```[\w]*:([^\s`\n]+)\s*\n([\s\S]*?)```/g;
    let match;
    while ((match = pattern1.exec(text)) !== null) {
      const filepath = match[1].trim();
      const content = match[2].trim();
      results[filepath] = content;
    }

    // Pattern 2: Filename in a comment before the code block
    // e.g. // src/main.py\n```python\n...```
    const pattern2 = /(?:\/\/|#|--)\s*([^\s\n]+)\s*\n```[\w]*\n([\s\S]*?)```/g;
    while ((match = pattern2.exec(text)) !== null) {
      const filepath = match[1].trim();
      const content = match[2].trim();
      if (!results[filepath]) results[filepath] = content;
    }

    // Pattern 3: Generic blocks mapped to expected files (if only one block and one expected file)
    if (Object.keys(results).length === 0) {
      const genericPattern = /```(?:\w+)?\s*\n([\s\S]*?)```/g;
      let i = 0;
      while ((match = genericPattern.exec(text)) !== null && i < expectedFiles.length) {
        const content = match[1].trim();
        // Try to find a filename in the text preceding the block
        const textBefore = text.substring(0, match.index);
        const linesBefore = textBefore.split('\n');
        const lastLine = linesBefore[linesBefore.length - 1].trim();
        
        // If the last line looks like a path, use it
        if (lastLine.includes('.') && !lastLine.includes(' ')) {
          results[lastLine] = content;
        } else {
          results[expectedFiles[i]] = content;
        }
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

  app.get("/api/ollama/status", async (req, res) => {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      if (!response.ok) throw new Error("Ollama not responding correctly");
      const data = await response.json();
      res.json({ online: true, models: data.models || [] });
    } catch (err: any) {
      res.json({ online: false, error: err.message });
    }
  });

  app.post("/api/agents/run", async (req, res) => {
    const { prompt, agentConfig, systemPrompt } = req.body;
    
    try {
      let text = "";

      const modelMapping: Record<string, string> = {
        'llama3': 'llama3:latest',
        'qwen': 'qwen2.5:latest',
        'qwen2.5b': 'qwen2.5:3b',
        'deep': 'deepseek-coder:latest',
        'deepseek': 'deepseek-coder:latest',
        'open claw': 'openclaw:latest',
        'openclaw': 'openclaw:latest',
        'opencoder': 'opencoder:latest'
      };
      
      const requestedModel = agentConfig.model?.toLowerCase() || "";
      const ollamaModel = modelMapping[requestedModel] || requestedModel || "llama3:latest";

      console.log(`Intentando conectar a Ollama (${ollamaModel}) en http://localhost:11434/api/generate`);
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: `${systemPrompt}\n\n---\n${prompt}`,
          stream: false,
          options: { temperature: 0.7, num_predict: 4096 }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama error response:", response.status, errorText);
        throw new Error(`Ollama error (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      console.log("Respuesta de Ollama recibida.");
      text = data.response;

      if (!text) {
        return res.status(500).json({ error: "No se pudo generar texto con el modelo local." });
      }

      const files = extractFiles(text, agentConfig.expectedFiles || []);
      res.json({ text, files });
    } catch (error: any) {
      console.error("Critical error in /api/agents/run:", error);
      const isCloud = process.env.NODE_ENV === "production" || process.env.K_SERVICE !== undefined;
      const msg = isCloud 
        ? "No se pudo conectar con Ollama. Nota: En el entorno de vista previa en la nube, 'Local' no funcionará porque Ollama no está instalado en el contenedor. Por favor, descarga el código y ejecútalo localmente en tu computadora para usar tus modelos locales."
        : `No se pudo conectar con Ollama en http://localhost:11434. Asegúrate de que Ollama esté instalado y ejecutándose en tu máquina. Error: ${error.message}`;
      
      res.status(503).json({ error: msg });
    }
  });

  app.post("/api/format", async (req, res) => {
    const { content, filepath } = req.body;
    const ext = path.extname(filepath).toLowerCase();
    
    let parser = "babel-ts";
    if (ext === ".css") parser = "css";
    if (ext === ".html") parser = "html";
    if (ext === ".json") parser = "json";
    if (ext === ".md") parser = "markdown";

    try {
      const formatted = await prettier.format(content, {
        parser,
        semi: true,
        singleQuote: true,
        trailingComma: "all",
      });
      res.json({ formatted });
    } catch (err: any) {
      console.error("Formatting error:", err);
      res.json({ formatted: content, error: err.message });
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
    const folderName = projectName.replace(/\s+/g, '-').toLowerCase();
    Object.entries(artifacts).forEach(([filepath, content]) => {
      zip.addFile(`${folderName}/${filepath}`, Buffer.from(content as string, "utf8"));
    });
    
    // Add a README.md if not present
    if (!artifacts['README.md']) {
      const readme = `# ${projectName}\n\nGenerated by MultiAgent Lab.\n\n## Structure\n${Object.keys(artifacts).map(f => `- ${f}`).join('\n')}`;
      zip.addFile(`${folderName}/README.md`, Buffer.from(readme, "utf8"));
    }

    res.set("Content-Type", "application/zip");
    res.set("Content-Disposition", `attachment; filename=${folderName}.zip`);
    res.send(zip.toBuffer());
  });

  // GitHub OAuth & Export
  app.get("/api/auth/github/url", (req, res) => {
    const { clientId: customClientId, clientSecret: customClientSecret } = req.query;
    
    const clientId = (customClientId as string) || process.env.GITHUB_CLIENT_ID;
    const clientSecret = (customClientSecret as string) || process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || process.env.APP_URL ? `${process.env.APP_URL}/api/auth/github/callback` : `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }

    // Encode credentials in state to retrieve them in the callback
    const state = Buffer.from(JSON.stringify({ clientId, clientSecret })).toString('base64');

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo&state=${state}`;
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code, state } = req.query;
    
    let clientId = process.env.GITHUB_CLIENT_ID;
    let clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const redirectUri = process.env.GITHUB_REDIRECT_URI || (process.env.APP_URL ? `${process.env.APP_URL}/api/auth/github/callback` : `${req.protocol}://${req.get('host')}/api/auth/github/callback`);
    
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf8'));
        if (decodedState.clientId) clientId = decodedState.clientId;
        if (decodedState.clientSecret) clientSecret = decodedState.clientSecret;
      } catch (e) {
        console.error("Error decoding state:", e);
      }
    }

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send("Missing code or configuration");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "MultiAgent-Lab-App"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      });

      const data = await response.json();
      
      if (data.error) {
        return res.status(400).send(`GitHub error: ${data.error_description || data.error}`);
      }

      // Return a simple HTML that posts the token to the opener
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${data.access_token}' }, '*');
                window.close();
              } else {
                document.body.innerHTML = 'Authentication successful! You can close this window.';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`Error exchanging code: ${err.message}`);
    }
  });

  app.post("/api/export/github", async (req, res) => {
    const { token, repoName, description, artifacts, isPrivate } = req.body;

    if (!token || !repoName || !artifacts) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Create Repository
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "MultiAgent-Lab-App"
        },
        body: JSON.stringify({
          name: repoName,
          description: description || "Generated by MultiAgent Lab",
          private: isPrivate || false,
          auto_init: true
        })
      });

      if (!createRepoRes.ok) {
        const err = await createRepoRes.json();
        throw new Error(`Failed to create repo: ${err.message}`);
      }

      const repoData = await createRepoRes.json();
      const owner = repoData.owner.login;

      // 2. Commit Files (one by one for simplicity, though not ideal for many files)
      for (const [path, content] of Object.entries(artifacts)) {
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
          method: "PUT",
          headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "MultiAgent-Lab-App"
          },
          body: JSON.stringify({
            message: `Add ${path}`,
            content: Buffer.from(content as string).toString('base64')
          })
        });
      }

      res.json({ success: true, url: repoData.html_url });
    } catch (err: any) {
      console.error("GitHub Export Error:", err);
      res.status(500).json({ error: err.message });
    }
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
