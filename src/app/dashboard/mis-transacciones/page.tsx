// src/app/dashboard/mis-transacciones/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Transaction, TransactionType } from "@/types";
import transactionService from "@/services/transactionService";
import { ArrowDownCircle, ArrowUpCircle, Calendar, Wallet, Landmark, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTERFAZ PARA ERRORES DE API ---
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- COMPONENTE DE FILTRO DE RANGO DE FECHAS ---
const DateRangePickerModal = ({ isOpen, onClose, onApply, initialStartDate, initialEndDate }: { isOpen: boolean, onClose: () => void, onApply: (start: string, end: string) => void, initialStartDate: string, initialEndDate: string }) => {
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate ? new Date(initialStartDate) : null);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate ? new Date(initialEndDate) : null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        setStartDate(initialStartDate ? new Date(initialStartDate) : null);
        setEndDate(initialEndDate ? new Date(initialEndDate) : null);
    }, [isOpen, initialStartDate, initialEndDate]);

    if (!isOpen) return null;

    const handleDateClick = (day: Date) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day < startDate) {
                setEndDate(startDate);
                setStartDate(day);
            } else {
                setEndDate(day);
            }
        }
    };

    const renderDays = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDateOfMonth = monthStart.getDay();
        const daysInMonth = monthEnd.getDate();
        const days = [];

        for (let i = 0; i < startDateOfMonth; i++) {
            days.push(<div key={`empty-start-${i}`} className="w-10 h-10"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const isSelectedStart = startDate && dayDate.getTime() === startDate.getTime();
            const isSelectedEnd = endDate && dayDate.getTime() === endDate.getTime();
            const isInRange = startDate && endDate && dayDate > startDate && dayDate < endDate;
            const isHoveringInRange = startDate && !endDate && hoverDate && dayDate > startDate && dayDate <= hoverDate;

            let baseClasses = "w-10 h-10 flex items-center justify-center transition-colors duration-200 cursor-pointer";
            let dayClasses = "";

            if (isSelectedStart || isSelectedEnd) {
                dayClasses = "bg-blue-600 text-white rounded-full";
            } else if (isInRange || isHoveringInRange) {
                dayClasses = "bg-blue-600/30 text-white rounded-md";
            } else {
                dayClasses = "text-slate-200 hover:bg-slate-700 rounded-full";
            }

            days.push(
                <button key={i} onClick={() => handleDateClick(dayDate)} onMouseEnter={() => setHoverDate(dayDate)} onMouseLeave={() => setHoverDate(null)} className={`${baseClasses} ${dayClasses}`}>
                    {i}
                </button>
            );
        }
        return days;
    };
    
    const handleApply = () => {
        if(startDate && endDate) {
            onApply(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
        }
    };
    
    const clearDates = () => {
        setStartDate(null);
        setEndDate(null);
        onApply('', '');
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6 text-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-slate-700"><ChevronLeft/></button>
                    <h3 className="font-bold text-lg">{currentMonth.toLocaleString('es-PE', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-slate-700"><ChevronRight/></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {renderDays()}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
                    <button onClick={clearDates} className="font-semibold text-slate-300 hover:text-white underline">Limpiar</button>
                    <button onClick={handleApply} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Aplicar</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const MisTransaccionesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const [activeTypeFilter, setActiveTypeFilter] = useState<TransactionType | 'TODAS'>('TODAS');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchClientTransactions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getClientTransactions(user.id);
      const sortedData = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setTransactions(sortedData);
      setFilteredTransactions(sortedData); // ✅ SOLUCIÓN: Poblar la lista filtrada al mismo tiempo que la original.
    } catch (err: unknown) {
      console.error('Error al obtener transacciones del cliente:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Error al cargar tus transacciones.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && user?.id) {
      fetchClientTransactions();
    }
  }, [user, authLoading, fetchClientTransactions]);

  const applyFilters = useCallback(() => {
    let tempTransactions = [...transactions];
    if (activeTypeFilter !== 'TODAS') {
      tempTransactions = tempTransactions.filter(t => t.tipo === activeTypeFilter);
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      // Ajuste para incluir la fecha de inicio completa
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      tempTransactions = tempTransactions.filter(t => {
        const transactionDate = new Date(t.fecha);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    setFilteredTransactions(tempTransactions);
  }, [activeTypeFilter, startDate, endDate, transactions]);

  useEffect(() => {
    // Ya no es necesario llamar a applyFilters aquí inicialmente,
    // pero se mantiene para que los filtros se apliquen cuando cambien.
    applyFilters();
  }, [applyFilters]);

  const handleApplyDateFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setIsDateModalOpen(false);
  }

  const getTypeInfo = (type: TransactionType) => {
    switch (type) {
      case 'RECARGA': return { color: 'text-green-400', icon: <ArrowDownCircle size={22} />, label: 'Recarga de Saldo' };
      case 'GASTO': return { color: 'text-red-400', icon: <ArrowUpCircle size={22} />, label: 'Compra de Servicio' };
      default: return { color: 'text-slate-400', icon: <Landmark size={22} />, label: 'Otro' };
    }
  };

  const typeFilterOptions: (TransactionType | 'TODAS')[] = ['TODAS', 'RECARGA', 'GASTO'];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300">Cargando tus transacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border-red-500/30 text-red-300 rounded-lg shadow-lg">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <AnimatePresence>
        <DateRangePickerModal 
            isOpen={isDateModalOpen} 
            onClose={() => setIsDateModalOpen(false)} 
            onApply={handleApplyDateFilter}
            initialStartDate={startDate}
            initialEndDate={endDate}
        />
      </AnimatePresence>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-4">Mis Transacciones</h1>
          <p className="text-lg text-slate-400 mb-8">
            Revisa tu historial de movimientos y filtra por tipo o período de tiempo.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-grow p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                <span className="text-sm font-semibold text-slate-400 mb-2 block">Filtrar por tipo</span>
                <div className="flex flex-wrap gap-2">
                {typeFilterOptions.map(filter => (
                    <button key={filter} onClick={() => setActiveTypeFilter(filter)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${activeTypeFilter === filter ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                    {filter.charAt(0) + filter.slice(1).toLowerCase()}
                    </button>
                ))}
                </div>
            </div>
             <div className="flex-grow p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                <span className="text-sm font-semibold text-slate-400 mb-2 block">Filtrar por fecha</span>
                <button onClick={() => setIsDateModalOpen(true)} className="w-full text-left px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 bg-slate-700/50 text-slate-300 hover:bg-slate-700 flex justify-between items-center">
                    <span>{startDate && endDate ? `${new Date(startDate).toLocaleDateString('es-PE')} - ${new Date(endDate).toLocaleDateString('es-PE')}` : "Seleccionar rango"}</span>
                    <Calendar size={16}/>
                </button>
            </div>
        </div>
        
        <AnimatePresence>
        {filteredTransactions.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-700">
            <Wallet size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-white">No se encontraron transacciones</h3>
            <p className="text-slate-400 mt-2">Prueba ajustando los filtros o realiza un nuevo movimiento.</p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const typeInfo = getTypeInfo(transaction.tipo);
              return (
                <motion.div
                  key={transaction.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700 rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center gap-4">
                     <div className="text-center w-20 flex-shrink-0">
                        <p className="font-semibold text-base text-white">{isClient ? new Date(transaction.fecha).toLocaleDateString('es-PE', {day: '2-digit', month: 'short'}) : '...'}</p>
                        <p className="text-xs text-slate-400">{isClient ? new Date(transaction.fecha).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'}) : '...'}</p>
                    </div>
                    <div className="w-1.5 h-10 bg-slate-700 rounded-full" />
                    <div>
                      <p className="font-semibold text-white">{transaction.descripcion}</p>
                      <p className={`text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-lg font-bold text-right ${typeInfo.color}`}>
                    <span>{transaction.tipo === 'GASTO' ? '-' : '+'} {transaction.cantidad}</span>
                    <Wallet size={18} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MisTransaccionesPage;
