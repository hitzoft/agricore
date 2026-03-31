import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
      bg: 'bg-red-50 dark:bg-red-500/10',
      btn: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      btn: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600',
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      btn: 'bg-agri-600 hover:bg-agri-700 dark:bg-agri-500 dark:hover:bg-agri-600',
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between p-7 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${config.bg}`}>
              {config.icon}
            </div>
            <h3 className="text-xl font-display text-gray-900 dark:text-agri-50">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed font-medium">{message}</p>
        </div>
        <div className="p-7 bg-gray-50/50 dark:bg-slate-800/20 flex gap-3 border-t border-gray-50 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 ${config.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
