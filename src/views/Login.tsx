import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión con Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-agri-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-12">
            <div className="w-30 h-30 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl border-4 border-white/10 group transition-all hover:rotate-12 duration-500 p-2 overflow-hidden">
               <img src="/favicon.png" alt="Agricore Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Agricore <span className="text-agri-400">Web</span></h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-[10px]">Gestión Agrícola Inteligente</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="p-6 bg-slate-800/30 rounded-3xl border border-white/5 text-center">
              <p className="text-slate-400 text-sm font-medium mb-6">Inicia sesión de forma segura con tu cuenta institucional de Google.</p>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-5 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Entrar con Google SSO
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
              <LogIn className="w-3 h-3 text-agri-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceso Restringido</span>
            </div>
            <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              ¿Problemas? <a href="mailto:soporte@agricore.com" className="text-agri-400 hover:text-agri-300 transition-colors">Contactar a soporte</a>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] mt-8">
          © 2026 AGRICORE SYSTEMS • MÉXICO
        </p>
      </div>
    </div>
  );
};

export default Login;
