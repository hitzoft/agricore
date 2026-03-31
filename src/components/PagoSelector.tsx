import React, { useState, useMemo } from 'react';
import { Plus, X, CreditCard, Banknote } from 'lucide-react';
import { useStore, generateId } from '../store/useStore';
import type { PagoDetalle } from '../store/useStore';

interface PagoSelectorProps {
  pagos: PagoDetalle[];
  onChange: (pagos: PagoDetalle[]) => void;
  maxMonto?: number;
}

export const PagoSelector: React.FC<PagoSelectorProps> = ({ pagos, onChange, maxMonto }) => {
  const cuentasRaw = useStore(state => state.cuentasBancarias);
  const cuentas = useMemo(() => {
    return cuentasRaw
      .filter(c => c.activo !== false)
      .sort((a, b) => {
        const nameA = `${a.banco || ''} ${a.nombre}`.toLowerCase();
        const nameB = `${b.banco || ''} ${b.nombre}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [cuentasRaw]);

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<'Efectivo' | 'Cuenta'>('Efectivo');
  const [cuentaId, setCuentaId] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const totalPagado = pagos.reduce((acc, p) => acc + p.monto, 0);
  const restante = maxMonto !== undefined ? Math.max(0, maxMonto - totalPagado) : undefined;

  const handleMontoChange = (raw: string) => {
    if (restante !== undefined) {
      const val = Number(raw);
      if (val > restante) {
        setMonto(restante.toString());
        return;
      }
    }
    setMonto(raw);
  };

  const handleAdd = () => {
    const valMonto = Number(monto);
    if (!valMonto || valMonto <= 0) return;
    if (metodo === 'Cuenta' && !cuentaId) return;
    // Hard cap — never exceed remaining balance
    if (restante !== undefined && valMonto > restante) return;

    const nuevoPago: PagoDetalle = {
      id: generateId(),
      fecha,
      monto: valMonto,
      metodo,
      cuentaId: metodo === 'Cuenta' ? cuentaId : undefined,
      nota: nota.trim() || undefined,
    };

    onChange([...pagos, nuevoPago]);
    setMonto('');
    setNota('');
  };

  const handleRemove = (id: string) => {
    onChange(pagos.filter(p => p.id !== id));
  };

  const addDisabled =
    !monto ||
    Number(monto) <= 0 ||
    (metodo === 'Cuenta' && !cuentaId) ||
    (restante !== undefined && Number(monto) > restante);

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-agri-50 text-sm flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-agri-600 dark:text-agri-400" />
        Registro de Pagos
      </h4>

      {pagos.length > 0 && (
        <div className="space-y-2 mb-4">
          {pagos.map(p => {
            const cuenta = p.cuentaId ? cuentas.find(c => c.id === p.cuentaId) : null;
            return (
              <div key={p.id} className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${p.metodo === 'Efectivo' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                      {p.metodo === 'Efectivo' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-agri-50 text-sm">{p.metodo}</span>
                        <span className="text-gray-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider">{p.fecha}</span>
                      </div>
                      {p.metodo === 'Cuenta' && cuenta && (
                        <p className="text-gray-500 dark:text-slate-400 text-xs font-medium">{cuenta.banco} — {cuenta.nombre}</p>
                      )}
                      {p.nota && (
                        <p className="text-gray-400 dark:text-slate-500 text-xs italic mt-0.5">"{p.nota}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-gray-900 dark:text-agri-50">${p.monto.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Only show the add form when there's still balance to pay */}
      {restante !== 0 && (
        <div className="bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-inner">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodo('Efectivo')}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                metodo === 'Efectivo'
                  ? 'bg-white dark:bg-slate-800 border-green-500 text-green-700 dark:text-green-400 shadow-md ring-4 ring-green-50 dark:ring-green-500/10'
                  : 'bg-transparent border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-100/50'
              }`}
            >
              <Banknote className={`w-6 h-6 ${metodo === 'Efectivo' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold uppercase tracking-tight">Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodo('Cuenta')}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                metodo === 'Cuenta'
                  ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md ring-4 ring-blue-50 dark:ring-blue-500/10'
                  : 'bg-transparent border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-100/50'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${metodo === 'Cuenta' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold uppercase tracking-tight">Transferencia</span>
            </button>
          </div>

          <div className="space-y-3">
            {metodo === 'Cuenta' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">Origen del Dinero</label>
                <select
                  value={cuentaId}
                  onChange={e => setCuentaId(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-agri-50 shadow-sm font-medium"
                >
                  <option value="" disabled>Seleccione cuenta...</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.banco || 'Banco'} — {c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-agri-500 text-sm bg-white dark:bg-slate-800 dark:text-agri-50 shadow-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">
                  Monto {restante !== undefined ? `(máx. $${restante.toLocaleString()})` : ''}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    max={restante !== undefined ? restante : undefined}
                    step="0.01"
                    placeholder={restante !== undefined ? restante.toFixed(2) : '0.00'}
                    value={monto}
                    onChange={e => handleMontoChange(e.target.value)}
                    className={`w-full border rounded-xl pl-7 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-agri-500 text-sm font-black bg-white dark:bg-slate-800 dark:text-agri-50 shadow-sm ${
                      restante !== undefined && Number(monto) > restante
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {restante !== undefined && Number(monto) > restante && (
                  <p className="text-xs text-red-500 font-medium ml-1">Supera el límite permitido</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">Nota / Referencia</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Pago parcial, folio transferencia..."
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  className="flex-1 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-agri-500 text-sm bg-white dark:bg-slate-800 dark:text-agri-50 shadow-sm font-medium"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={addDisabled}
                  className="bg-agri-600 text-white px-5 rounded-xl hover:bg-agri-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {maxMonto !== undefined && (
        <div className="flex items-center justify-between px-1 text-sm pt-2">
          <span className="text-gray-500 dark:text-slate-400">Total a pagar: <strong className="text-gray-900 dark:text-agri-50">${maxMonto.toLocaleString()}</strong></span>
          <span className={`font-medium ${restante === 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {restante === 0 ? '✓ Liquidado' : `Resta: $${restante?.toLocaleString()}`}
          </span>
        </div>
      )}
    </div>
  );
};
