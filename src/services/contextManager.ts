import { AGENTS } from './agentService';

export interface ContextItem {
  id: string;
  source: string;
  content: string;
  type: 'brief' | 'decision' | 'code' | 'chat' | 'agent_output';
  timestamp: number;
  relevance?: number;
}

export class ContextManager {
  private items: ContextItem[] = [];
  private maxContextTokens = 10000; // Estimated chars for simplicity

  add(item: Omit<ContextItem, 'timestamp'>) {
    this.items.push({
      ...item,
      timestamp: Date.now()
    });
  }

  async getRelevantContext(query: string, limit: number = 5): Promise<string> {
    if (this.items.length === 0) return "No hay contexto previo disponible.";

    // Simple relevance scoring based on keyword overlap
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    const scoredItems = this.items.map(item => {
      let score = 0;
      const content = item.content.toLowerCase();
      
      // Keyword match
      queryWords.forEach(word => {
        if (content.includes(word)) score += 1;
      });

      // Recency bias
      const ageInMinutes = (Date.now() - item.timestamp) / (1000 * 60);
      score += Math.max(0, 5 - ageInMinutes / 10);

      // Type weight
      if (item.type === 'brief') score += 10;
      if (item.type === 'decision') score += 8;

      return { ...item, score };
    });

    const relevantItems = scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    let contextStr = "--- CONTEXTO DINÁMICO RELEVANTE ---\n\n";
    relevantItems.forEach(item => {
      contextStr += `[${item.type.toUpperCase()}] de ${item.source}:\n${item.content}\n\n`;
    });

    return contextStr;
  }

  clear() {
    this.items = [];
  }

  getAll() {
    return this.items;
  }
}
