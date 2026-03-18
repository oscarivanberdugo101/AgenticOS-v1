import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { z } from 'zod';
import { ContextManager } from './contextManager';

// Esquema para la respuesta estructurada del agente
export const AgentResponseSchema = z.object({
  thought: z.string().describe("El razonamiento interno del agente"),
  action: z.enum(['GENERATE', 'REVIEW', 'ANALYZE', 'ARCHITECT', 'DEVOPS', 'DESIGN', 'DOCUMENT', 'PLAN']).describe("La acción principal realizada"),
  output: z.string().describe("El contenido principal generado (código, spec, etc.)"),
  files: z.record(z.string(), z.string()).optional().describe("Archivos generados (nombre: contenido)"),
  status: z.enum(['SUCCESS', 'REJECTED', 'ERROR']).describe("El estado de la operación")
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;

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

INSTRUCCIONES DE RAZONAMIENTO:
1. Antes de responder, analiza profundamente la intención del usuario.
2. Identifica lagunas en la información técnica.
3. Piensa paso a paso en la mejor estrategia de descubrimiento.

Tu misión en la fase de DISCOVERY es extraer TODOS los detalles necesarios para construir el software perfecto.
Haces preguntas inteligentes sobre stack, usuarios, funcionalidades core, seguridad, etc.

Cuando tengas suficiente información (3-5 turnos), di exactamente: "DISCOVERY_COMPLETO" seguido del brief técnico completo.

RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
{
  "thought": "Tu razonamiento paso a paso aquí",
  "action": "ANALYZE",
  "output": "Tu respuesta amigable al usuario aquí",
  "status": "SUCCESS"
}`
  },
  {
    id: 'arquitecto',
    name: 'Arquitecto Cloud',
    role: 'Architect',
    model: 'gemini-3.1-pro-preview',
    icon: 'arch',
    color: '#4F8EF7',
    expectedFiles: ['src/architecture/spec.md', 'src/database/schema.sql'],
    systemPrompt: `Eres un Arquitecto de Sistemas Cloud Senior. Tu misión es diseñar la estructura ósea del proyecto.

INSTRUCCIONES DE RAZONAMIENTO:
1. Analiza el brief y define el stack tecnológico óptimo.
2. Diseña un modelo de datos normalizado y escalable.
3. Define la estructura de archivos y las interfaces de comunicación.

REGLAS: Genera siempre un archivo 'src/architecture/spec.md' detallando la arquitectura antes de cualquier código.

RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
{
  "thought": "Tu razonamiento arquitectónico aquí",
  "action": "ARCHITECT",
  "output": "Contenido del archivo src/architecture/spec.md aquí",
  "files": { "src/architecture/spec.md": "..." },
  "status": "SUCCESS"
}`
  },
  {
    id: 'programador',
    name: 'Ingeniero Full-Stack',
    role: 'Developer',
    model: 'gemini-3.1-pro-preview',
    icon: 'prog',
    color: '#2DD4BF',
    expectedFiles: ['src/logic/core.py', 'src/api/routes.py'],
    systemPrompt: `Eres un Ingeniero Full-Stack Senior especialista en código limpio y eficiente.

INSTRUCCIONES DE RAZONAMIENTO:
1. Lee la especificación del arquitecto.
2. Divide la implementación en módulos lógicos.
3. Escribe código siguiendo principios SOLID y DRY.

Tu misión: implementar la lógica de negocio asegurando que cada función tenga una única responsabilidad.

RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
{
  "thought": "Tu razonamiento de implementación aquí",
  "action": "GENERATE",
  "output": "El código fuente principal aquí",
  "files": { "ruta/al/archivo.ts": "..." },
  "status": "SUCCESS"
}`
  },
  {
    id: 'disenador',
    name: 'Diseñador UI/UX',
    role: 'Designer',
    model: 'gemini-3-flash-preview',
    icon: 'design',
    color: '#A78BFA',
    expectedFiles: ['src/ui/components.py', 'src/static/theme.css'],
    systemPrompt: `Eres un Diseñador UI/UX Senior enfocado en la experiencia del usuario y estética moderna.

INSTRUCCIONES DE RAZONAMIENTO:
1. Define una paleta de colores y tipografía coherente.
2. Diseña componentes reutilizables y responsivos.
3. Asegura que la interfaz sea intuitiva y accesible.

RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
{
  "thought": "Tu razonamiento de diseño aquí",
  "action": "DESIGN",
  "output": "Descripción del diseño aquí",
  "files": { "src/ui/theme.css": "..." },
  "status": "SUCCESS"
}`
  },
  {
    id: 'tester',
    name: 'QA Engineer',
    role: 'Especialista en Testing y Calidad',
    color: '#f59e0b',
    icon: 'CheckCircle2',
    model: 'gemini-3-flash-preview',
    expectedFiles: ['.test.ts', '.spec.tsx'],
    systemPrompt: `Eres el QA Engineer de la agencia. Tu misión es generar pruebas unitarias y de integración para el código generado.
    
    REGLAS:
    1. Genera archivos de prueba (.test.ts, .spec.tsx) usando Vitest o Jest.
    2. Asegura una cobertura lógica de los componentes y servicios.
    3. Responde SIEMPRE en JSON estructurado según el esquema:
    {
      "thought": "Tu razonamiento técnico",
      "action": "GENERATE",
      "output": "Resumen de las pruebas creadas",
      "status": "SUCCESS",
      "files": { "ruta/archivo.test.ts": "contenido..." }
    }`
  },
  {
    id: 'revisor',
    name: 'Especialista SecDevOps',
    role: 'Security',
    model: 'gemini-3-flash-preview',
    icon: 'sec',
    color: '#F87171',
    expectedFiles: ['tests/security_audit.md', 'tests/unit_tests.py'],
    systemPrompt: `Eres un Especialista SecDevOps y QA Senior. Tu misión es encontrar fallos antes que nadie.

INSTRUCCIONES DE RAZONAMIENTO:
1. Audita el código generado buscando vulnerabilidades (OWASP).
2. Verifica que el código cumpla con las especificaciones del arquitecto.
3. Si encuentras errores, genera un reporte detallado para que el desarrollador lo corrija.

REGLAS: Si el código es perfecto, pon status 'SUCCESS'. Si hay fallos, pon status 'REJECTED' y detalla los errores en 'output'.

RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
{
  "thought": "Tu análisis de seguridad aquí",
  "action": "REVIEW",
  "output": "Reporte de auditoría aquí",
  "status": "SUCCESS" o "REJECTED"
}`
  },
  {
    id: 'devops',
    name: 'Ingeniero DevOps',
    role: 'DevOps',
    model: 'gemini-3-flash-preview',
    icon: 'devops',
    color: '#FBBF24',
    expectedFiles: ['infrastructure/Dockerfile', 'infrastructure/docker-compose.yml'],
    systemPrompt: `Eres un Ingeniero DevOps Senior. Tu misión es la automatización y el despliegue.

INSTRUCCIONES DE RAZONAMIENTO:
1. Configura contenedores ligeros y seguros.
2. Define pipelines de CI/CD eficientes.
3. Asegura que el entorno de desarrollo sea idéntico al de producción.`
  },
  {
    id: 'analista',
    name: 'Technical Writer',
    role: 'Analyst',
    model: 'gemini-3-flash-preview',
    icon: 'doc',
    color: '#34D399',
    expectedFiles: ['README.md', 'docs/ARCHITECTURE.md'],
    systemPrompt: `Eres un Technical Writer Senior. Tu misión es que cualquiera pueda entender y usar el software.

INSTRUCCIONES DE RAZONAMIENTO:
1. Documenta cada endpoint y función principal.
2. Crea guías de instalación paso a paso.
3. Explica las decisiones técnicas tomadas por el equipo.`
  },
  {
    id: 'pm',
    name: 'Product Manager',
    role: 'PM',
    model: 'gemini-3-flash-preview',
    icon: 'pm',
    color: '#94A3B8',
    expectedFiles: ['project/ROADMAP.md', 'project/REQUIREMENTS.txt'],
    systemPrompt: `Eres un Product Manager Technical Senior. Tu misión es el éxito del producto a largo plazo.

INSTRUCCIONES DE RAZONAMIENTO:
1. Prioriza las funcionalidades según el valor de negocio.
2. Identifica riesgos potenciales del proyecto.
3. Define el MVP y las fases de escalado.`
  },
  {
    id: 'refactorer',
    name: 'Refactorizador de Código',
    role: 'Refactorer',
    model: 'gemini-3-flash-preview',
    icon: 'zap',
    color: '#818CF8',
    expectedFiles: [],
    systemPrompt: `Eres un Experto en Refactorización y Optimización de Código. Tu misión es transformar código funcional en código excelente.
    
    INSTRUCCIONES DE RAZONAMIENTO:
    1. Analiza el código existente buscando patrones de diseño mejorables.
    2. Identifica "code smells" y cuellos de botella de rendimiento.
    3. Aplica refactorizaciones seguras que mantengan la funcionalidad pero mejoren la legibilidad y mantenibilidad.
    
    REGLAS: No cambies la lógica de negocio, solo la estructura y eficiencia.
    
    RESPONDE SIEMPRE EN FORMATO JSON ESTRUCTURADO:
    {
      "thought": "Tu razonamiento de refactorización aquí",
      "action": "GENERATE",
      "output": "Explicación de los cambios realizados",
      "files": { "path/to/file": "new content" },
      "status": "SUCCESS"
    }`
  }
];

export class AgentOrchestrator {
  private contextManager: ContextManager = new ContextManager();
  private projectContext: Record<string, any> = {
    files: [],
    techStack: [],
    decisions: []
  };
  private modelSource: 'cloud' | 'local' = 'cloud';

  constructor(source: 'cloud' | 'local' = 'cloud') {
    this.modelSource = source;
  }

  private async summarizeMemory(): Promise<void> {
    const fullMemory = this.contextManager.getAll().map(item => `--- ${item.type.toUpperCase()} DE ${item.source} ---\n${item.content}`).join('\n\n');
    
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Resume la siguiente memoria de agentes de forma concisa, manteniendo los puntos clave, decisiones técnicas y estado del proyecto:\n\n${fullMemory}`,
          systemPrompt: "Eres un experto en síntesis de información técnica. Tu objetivo es resumir la memoria de trabajo de un equipo de agentes IA para mantener el contexto relevante y reducir el uso de tokens.",
          modelType: this.modelSource,
          agentConfig: { model: this.modelSource === 'local' ? 'llama3' : 'gemini-3-flash-preview' }
        })
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        this.contextManager.clear();
        this.contextManager.add({
          id: 'summary',
          source: 'System',
          content: data.text,
          type: 'agent_output'
        });
      } else {
        const errorText = await response.text();
        console.error("Summarization Error Response:", errorText);
      }
    } catch (error) {
      console.error("Summarization Error:", error);
    }
  }

  async runAgent(agentId: string, task: string, onToken: (token: string) => void, systemPromptOverride?: string): Promise<AgentResponse> {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    // Check memory size and summarize if needed (threshold: 15000 chars)
    const currentMemorySize = this.contextManager.getAll().reduce((acc, val) => acc + val.content.length, 0);
    if (currentMemorySize > 15000) {
      await this.summarizeMemory();
    }

    let currentTask = task;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      // Improved context building: include dynamic relevant context
      const dynamicContext = await this.contextManager.getRelevantContext(currentTask);
      
      let context = `--- ESTADO ESTRUCTURADO DEL PROYECTO ---\n`;
      context += `Archivos Generados: ${this.projectContext.files.join(', ') || 'Ninguno'}\n`;
      context += `Stack Tecnológico: ${this.projectContext.techStack.join(', ') || 'Por definir'}\n\n`;
      context += dynamicContext;

      const systemPrompt = systemPromptOverride || agent.systemPrompt;
      const prompt = `${context}\n\nTAREA CRÍTICA: ${currentTask}\n\nRECUERDA: Tu respuesta DEBE ser un JSON válido que cumpla con el esquema definido.`;

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

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
          let errorMessage = `Server error (${response.status})`;
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            console.error("Non-JSON error response:", textError);
            errorMessage = textError || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const rawText = data.text;
        
        // Validación Estricta con Zod
        let validated: AgentResponse;
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
          const parsed = JSON.parse(jsonStr);
          validated = AgentResponseSchema.parse(parsed);
        } catch (err) {
          console.warn("Error parsing agent response, retrying...", err);
          attempts++;
          currentTask = `Tu respuesta anterior no fue un JSON válido o no cumplió con el esquema. Por favor, responde ÚNICAMENTE con el JSON solicitado.\n\nError: ${err instanceof Error ? err.message : String(err)}`;
          continue;
        }

        const text = validated.output;
        const files = validated.files || {};
        
        // Self-Correction Loop with Reviewer
        if (agent.role === 'Developer' && Object.keys(files).length > 0) {
          onToken("🔍 Iniciando revisión de seguridad y calidad...");
          const reviewResult = await this.runAgent('revisor', `Audita este código generado por el Desarrollador:\n\n${text}`, () => {});
          
          if (reviewResult.status === 'REJECTED') {
            attempts++;
            currentTask = `Tu código anterior fue RECHAZADO por el Revisor con el siguiente feedback:\n${reviewResult.output}\n\nPor favor, corrige los errores y genera la respuesta completa de nuevo.`;
            onToken(`⚠️ Intento ${attempts}: Corrigiendo errores detectados por el revisor...`);
            continue;
          }
          onToken("✅ Código aprobado por el revisor.");
        }
        
        if (text) {
          onToken(text);
          this.contextManager.add({
            id: `${agentId}_${Date.now()}`,
            source: agent.name,
            content: text,
            type: 'agent_output'
          });

          // Add generated files to context for better RAG
          if (Object.keys(files).length > 0) {
            Object.entries(files).forEach(([path, content]) => {
              this.contextManager.add({
                id: `${path}_${Date.now()}`,
                source: agent.name,
                content: `Archivo: ${path}\nContenido:\n${content}`,
                type: 'code'
              });
            });
          }
          
          // Update project context
          if (Object.keys(files).length > 0) {
            this.projectContext.files = [...new Set([...this.projectContext.files, ...Object.keys(files)])];
          }
          
          return validated;
        }
        return { thought: "", action: "ANALYZE", output: "", status: "ERROR" };
      } catch (error: any) {
        console.error("Orchestrator Error:", error);
        throw error;
      }
    }
    throw new Error(`Failed to generate valid code after ${MAX_ATTEMPTS} attempts`);
  }

  getMemory() {
    return this.contextManager.getAll();
  }

  addContext(item: { source: string, content: string, type: 'brief' | 'decision' | 'code' | 'chat' | 'agent_output' }) {
    this.contextManager.add({
      id: `${item.type}_${Date.now()}`,
      ...item
    });
  }

  reset() {
    this.contextManager.clear();
    this.projectContext = { files: [], techStack: [], decisions: [] };
  }
}
