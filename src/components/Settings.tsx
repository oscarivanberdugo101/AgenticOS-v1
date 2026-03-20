import { useState, useEffect } from 'react';

export function Settings() {
  const [mode, setMode] = useState(localStorage.getItem('AI_MODE') || 'local');

  useEffect(() => {
    localStorage.setItem('AI_MODE', mode);
  }, [mode]);

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
        </select>
      </div>
      
      <p className="text-xs text-slate-500 mt-4">
        Tus configuraciones se guardan localmente en tu navegador.
      </p>
    </div>
  );
}
