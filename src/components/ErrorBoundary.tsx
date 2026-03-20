import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      let parsedError: any = null;
      try {
        if (this.state.error?.message) {
          parsedError = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not JSON
      }

      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/5 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400">Algo salió mal</h1>
                <p className="text-gray-400">La aplicación encontró un error inesperado.</p>
              </div>
            </div>

            {parsedError && parsedError.operationType ? (
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-2">Error de Permisos (Firestore)</h2>
                <p className="text-sm text-gray-300 mb-1"><strong>Operación:</strong> {parsedError.operationType}</p>
                <p className="text-sm text-gray-300 mb-1"><strong>Ruta:</strong> {parsedError.path}</p>
                <p className="text-sm text-red-400 mt-2">No tienes permisos suficientes para realizar esta acción. Revisa las reglas de seguridad de Firestore.</p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/10 overflow-auto max-h-64">
                <h2 className="text-lg font-semibold text-white mb-2">Detalles del Error</h2>
                <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
