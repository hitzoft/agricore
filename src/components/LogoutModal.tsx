import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        {/* Header/Icon Section */}
        <div className="p-8 pb-0 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 ring-8 ring-red-50/50">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display text-slate-900 mb-2">Cerrar Sesión</h2>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            ¿Estás seguro de que quieres salir? 
          </p>
        </div>

        {/* Warning Box */}
        <div className="px-8 mt-6">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-4 items-start">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <LogOut className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Aviso de Privacidad</p>
              <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
                Para proteger tu privacidad multi-tenant, limpiaremos la base de datos local. Asegúrate de tener conexión a Internet para no perder cambios pendientes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-2 bg-red-600 text-white rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-600/20 hover:bg-red-700 flex items-center justify-center gap-3"
          >
            Confirmar Salida
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default LogoutModal;
