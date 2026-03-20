import React, { useState, useEffect } from 'react';
import { Shield, Github, Save, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { UserSettings } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface SettingsSectionProps {
  userId: string;
}

export const SettingsSection = ({ userId }: SettingsSectionProps) => {
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'settings', 'integrations');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings);
        }
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, `users/${userId}/settings/integrations`);
        setError("Error al cargar la configuración.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const docRef = doc(db, 'users', userId, 'settings', 'integrations');
      await setDoc(docRef, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/settings/integrations`);
      setError("Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  const callbackUrl = `${window.location.origin}/api/auth/github/callback`;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h2 className="text-5xl font-extralight text-white tracking-tighter">Configuración</h2>
        <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] font-black">Personaliza tu entorno de desarrollo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-neon-blue">
              <Shield size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Seguridad</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Tus credenciales se almacenan de forma segura en tu perfil de usuario y solo se utilizan para las integraciones que autorices.
            </p>
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <Github size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">GitHub App</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Para exportar proyectos a GitHub, necesitas crear una OAuth App en tu cuenta de GitHub.
            </p>
            <a 
              href="https://github.com/settings/developers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
            >
              Abrir GitHub <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="size-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <Github size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Integración con GitHub</h4>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">OAuth Application Credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Client ID</label>
                  <input 
                    type="text"
                    value={settings.githubClientId || ''}
                    onChange={(e) => setSettings({ ...settings, githubClientId: e.target.value })}
                    placeholder="Iv1.xxxxxxxxxxxx"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Client Secret</label>
                  <input 
                    type="password"
                    value={settings.githubClientSecret || ''}
                    onChange={(e) => setSettings({ ...settings, githubClientSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                  />
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Importante</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    Debes configurar la <strong>Authorization callback URL</strong> en tu GitHub App con el siguiente valor para que la autenticación funcione:
                  </p>
                  <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                    <code className="text-[9px] text-amber-200/70 flex-1 truncate">{callbackUrl}</code>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(callbackUrl)}
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Save size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <p className="text-[9px] text-neutral-600 italic">
                * Los cambios se aplicarán en tu próxima sesión de exportación.
              </p>
              <button 
                type="submit"
                disabled={saving}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                  saved 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-black hover:bg-neon-blue shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                    Guardando...
                  </>
                ) : saved ? (
                  <>
                    <Check size={14} />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
