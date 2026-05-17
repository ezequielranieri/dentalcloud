'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/agenda');
      router.refresh();
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryLoading(true);
    setError(null);
    setMessage(null);

    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (recoveryError) {
      setError(recoveryError.message);
    } else {
      setMessage('Se ha enviado un correo de recuperación a tu email.');
      setShowRecovery(false);
    }
    setRecoveryLoading(false);
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@dentalcloud.com',
      password: 'demo1234',
    });

    if (authError) {
      setError('Las credenciales de demo no están disponibles actualmente.');
      setLoading(false);
    } else {
      router.push('/agenda');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
            <Activity className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dental<span className="text-blue-600">Cloud</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión Odontológica Eficiente</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {showRecovery ? 'Recuperar contraseña' : 'Iniciar sesión'}
          </h2>

          <form onSubmit={showRecovery ? handleRecovery : handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium leading-tight">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Activity className="text-green-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-green-700 font-medium leading-tight">{message}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dentalcloud.com"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm !text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {!showRecovery && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(true);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm !text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || recoveryLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading || recoveryLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {showRecovery ? 'Enviando...' : 'Ingresando...'}
                  </>
                ) : (
                  showRecovery ? 'Mandar link de recuperación' : 'Entrar'
                )}
              </button>

              {!showRecovery && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full bg-white text-blue-600 border border-blue-200 font-semibold py-2.5 rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  Ver Demo
                </button>
              )}

              {showRecovery && (
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors py-1 text-center"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          DentalCloud Manager &copy; 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
