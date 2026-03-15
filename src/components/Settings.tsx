import { useState, useEffect } from 'react';

export function Settings() {
  const [mode, setMode] = useState(localStorage.getItem('AI_MODE') || 'local');
  const [apiKey, setApiKey] = useState(localStorage.getItem('AI_API_KEY') || '');

  useEffect(() => {
    localStorage.setItem('AI_MODE', mode);
    localStorage.setItem('AI_API_KEY', apiKey);
  }, [mode, apiKey]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Configuración de IA</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Modo de ejecución</label>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md"
        >
          <option value="local">Local (Ollama)</option>
          <option value="cloud">Cloud (Gemini)</option>
          <option value="mixed">Mixto (Local con fallback a Cloud)</option>
        </select>
      </div>

      {mode === 'cloud' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API Key aquí"
            className="w-full p-2 border border-slate-300 rounded-md"
          />
        </div>
      )}
      
      <p className="text-xs text-slate-500 mt-4">
        Tus configuraciones se guardan localmente en tu navegador.
      </p>
    </div>
  );
}
