import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  icon: string;
  color: string;
  systemPrompt: string;
  expectedFiles: string[];
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'director',
    name: 'Director de Proyecto',
    role: 'Director',
    model: 'gemini-3-flash-preview',
    icon: 'director',
    color: '#FFD700',
    expectedFiles: [],
    systemPrompt: `Eres el Director de Proyecto Senior de un equipo de élite de desarrollo de software.
Tu personalidad: profesional, empático, preciso, orientado a resultados. Hablas en español.

Tu misión en la fase de DISCOVERY es extraer TODOS los detalles necesarios para construir el software perfecto.
Haces preguntas inteligentes sobre stack, usuarios, funcionalidades core, seguridad, etc.

Cuando tengas suficiente información (3-5 turnos), di exactamente: "DISCOVERY_COMPLETO" seguido del brief técnico completo.`
  },
  {
    id: 'arquitecto',
    name: 'Arquitecto Cloud',
    role: 'Architect',
    model: 'gemini-3.1-pro-preview',
    icon: 'arch',
    color: '#4F8EF7',
    expectedFiles: ['src/__init__.py', 'src/database.py'],
    systemPrompt: `Eres un Arquitecto de Sistemas Cloud Senior. Genera arquitectura escalable y modelos de datos.
REGLAS: SQLAlchemy 2.0, sin credenciales hardcodeadas, production-ready.`
  },
  {
    id: 'programador',
    name: 'Ingeniero Full-Stack',
    role: 'Developer',
    model: 'gemini-3.1-pro-preview',
    icon: 'prog',
    color: '#2DD4BF',
    expectedFiles: ['src/logic.py', 'src/main.py'],
    systemPrompt: `Eres un Ingeniero Full-Stack Senior especialista en Python, FastAPI y APIs REST.
Tu misión: implementar lógica de negocio limpia y eficiente.`
  },
  {
    id: 'disenador',
    name: 'Diseñador UI/UX',
    role: 'Designer',
    model: 'gemini-3-flash-preview',
    icon: 'design',
    color: '#A78BFA',
    expectedFiles: ['src/ui.py', 'src/styles.css'],
    systemPrompt: `Eres un Diseñador UI/UX Senior. Crea interfaces Streamlit profesionales con tema claro/oscuro.`
  },
  {
    id: 'revisor',
    name: 'Especialista SecDevOps',
    role: 'Security',
    model: 'gemini-3.1-pro-preview',
    icon: 'sec',
    color: '#F87171',
    expectedFiles: ['tests/__init__.py', 'tests/test_logic.py', 'tests/test_security.py'],
    systemPrompt: `Eres un Especialista SecDevOps. Auditoría OWASP y suite de tests pytest.`
  },
  {
    id: 'devops',
    name: 'Ingeniero DevOps',
    role: 'DevOps',
    model: 'gemini-3.1-pro-preview',
    icon: 'devops',
    color: '#FBBF24',
    expectedFiles: ['Dockerfile', 'docker-compose.yml', '.github/workflows/ci.yml'],
    systemPrompt: `Eres un Ingeniero DevOps Senior. Genera infraestructura lista para producción (Docker, CI/CD).`
  },
  {
    id: 'analista',
    name: 'Technical Writer',
    role: 'Analyst',
    model: 'gemini-3-flash-preview',
    icon: 'doc',
    color: '#34D399',
    expectedFiles: ['docs/README.md', 'docs/API.md'],
    systemPrompt: `Eres un Technical Writer Senior. Documentación técnica completa y clara.`
  },
  {
    id: 'pm',
    name: 'Product Manager',
    role: 'PM',
    model: 'gemini-3-flash-preview',
    icon: 'pm',
    color: '#94A3B8',
    expectedFiles: ['docs/ROADMAP.md', 'requirements.txt', '.env.example', '.gitignore'],
    systemPrompt: `Eres un Product Manager Technical Senior. Define roadmap, dependencias y configuración.`
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Coder',
    role: 'Lead Coder',
    model: 'deepseek-coder',
    icon: 'prog',
    color: '#3B82F6',
    expectedFiles: ['src/core/logic.py', 'src/core/utils.py'],
    systemPrompt: `Eres DeepSeek Coder, un modelo especializado en programación de alto rendimiento.
Tu misión: resolver los problemas de lógica más complejos, optimizar algoritmos y asegurar que el código sea elegante y eficiente.
Trabajas en conjunto con el Ingeniero Full-Stack para elevar la calidad del software.`
  }
];

export class AgentOrchestrator {
  private memory: Record<string, string> = {};
  private modelSource: 'cloud' | 'local' = 'cloud';

  constructor(source: 'cloud' | 'local' = 'cloud') {
    this.modelSource = source;
  }

  private async summarizeMemory(): Promise<void> {
    const fullMemory = Object.entries(this.memory).map(([id, output]) => `--- OUTPUT DE ${id.toUpperCase()} ---\n${output}`).join('\n\n');
    
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Resume la siguiente memoria de agentes de forma concisa, manteniendo los puntos clave, decisiones técnicas y estado del proyecto:\n\n${fullMemory}`,
          systemPrompt: "Eres un experto en síntesis de información técnica. Tu objetivo es resumir la memoria de trabajo de un equipo de agentes IA para mantener el contexto relevante y reducir el uso de tokens.",
          modelType: this.modelSource,
          agentConfig: { model: 'gemini-3-flash-preview' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.memory = { 'summary': data.text };
      }
    } catch (error) {
      console.error("Summarization Error:", error);
    }
  }

  async runAgent(agentId: string, task: string, onToken: (token: string) => void, systemPromptOverride?: string): Promise<{ text: string, files: Record<string, string> }> {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    // Check memory size and summarize if needed (threshold: 15000 chars)
    const currentMemorySize = Object.values(this.memory).reduce((acc, val) => acc + val.length, 0);
    if (currentMemorySize > 15000) {
      await this.summarizeMemory();
    }

    let currentTask = task;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      // Improved context building: include full memory, but consider summarization in future iterations
      let context = `PROYECTO: MultiAgent Lab\nTAREA ACTUAL: ${currentTask}\n\n`;
      
      Object.entries(this.memory).forEach(([id, output]) => {
        context += `--- OUTPUT DE ${id.toUpperCase()} ---\n${output}\n\n`;
      });

      const systemPrompt = systemPromptOverride || agent.systemPrompt;
      const prompt = `${context}\n\nTAREA A EJECUTAR: ${currentTask}`;

      try {
        const response = await fetch('/api/agents/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            systemPrompt,
            modelType: this.modelSource,
            agentConfig: agent
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to run agent');
        }

        const data = await response.json();
        const text = data.text;
        const files = data.files || {};
        
        if (Object.keys(files).length > 0) {
          const validationResponse = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files })
          });
          const validationData = await validationResponse.json();
          
          if (!validationData.valid) {
            attempts++;
            currentTask = `El código generado tiene errores de compilación:\n${validationData.error}\n\nPor favor, corrige el código y genera la respuesta completa de nuevo.`;
            continue;
          }
        }
        
        if (text) {
          onToken(text);
          this.memory[agentId] = text;
          return { text, files };
        }
        return { text: "", files: {} };
      } catch (error: any) {
        console.error("Orchestrator Error:", error);
        throw error;
      }
    }
    throw new Error(`Failed to generate valid code after ${MAX_ATTEMPTS} attempts`);
  }

  getMemory() {
    return this.memory;
  }

  reset() {
    this.memory = {};
  }
}
