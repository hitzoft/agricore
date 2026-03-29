import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-agri-950 flex flex-col items-center justify-center z-[9999]">
      <div className="relative">
        {/* Glow effect */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-agri-600 rounded-full blur-3xl"
        />
        
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-32 h-32 bg-white rounded-[32px] flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white/20"
        >
          <img src="/logo.png" alt="Agricore" className="w-full h-full object-cover scale-[2.5]" />
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 text-center"
      >
        <h2 className="text-white text-2xl font-display tracking-tight mb-2">Agricore</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-agri-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-agri-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-agri-400 rounded-full animate-bounce" />
          <span className="text-agri-100/60 text-[10px] font-bold uppercase tracking-[0.2em] ml-2">Cargando Sistema</span>
        </div>
      </motion.div>
      
      {/* Footer message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 text-agri-300/40 text-[9px] font-medium tracking-widest uppercase"
      >
        Optimizado para Gestión Agrícola • v1.1.5
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
