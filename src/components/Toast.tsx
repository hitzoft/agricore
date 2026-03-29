import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Toast = ({ id, message, type }: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => {
  const removeToast = useStore(state => state.removeToast);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
    warning: 'bg-orange-50 border-orange-100',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg transition-all animate-in slide-in-from-right-10 duration-300 w-80 ${bgColors[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button 
        onClick={() => removeToast(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useStore(state => state.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
