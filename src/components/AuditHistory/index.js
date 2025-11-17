import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { useTheme } from '../../contexts/ThemeContext';
import './AuditHistory.css';

const AuditHistory = ({ equipmentId, equipamentoId, equipmentName }) => {
  // Suporte a ambas as props: equipmentId (en) e equipamentoId (pt)
  const resolvedEquipmentId = equipmentId || equipamentoId;
  const { isDarkMode } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [resolvedEquipmentId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const auditHistory = await auditService.getEquipmentHistory(resolvedEquipmentId);
      setHistory(auditHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Erro ao carregar histórico de mudanças');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return '#27ae60';
      case 'update':
        return '#f39c12';
      case 'delete':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg p-6 my-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            📝 Histórico de Mudanças
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Carregando histórico de {equipmentName}...
          </p>
        </div>
        <div className="text-center text-2xl py-8">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 my-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            📝 Histórico de Mudanças
          </h3>
          <p className="text-red-600 dark:text-red-400">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`rounded-lg p-6 my-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            📝 Histórico de Mudanças
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Nenhuma mudança registrada para {equipmentName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 my-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
      <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
          📝 Histórico de Mudanças
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Histórico completo de alterações em {equipmentName}
        </p>
      </div>

      <div className="relative pl-10">
        {/* Timeline line */}
        <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-indigo-600/30' : 'bg-indigo-200'}`}></div>
        
        {history.map((entry, index) => {
          const formatted = auditService.formatChange(entry);
          return (
            <div key={`${entry.id || entry.timestamp || 'entry'}-${index}`} className="flex items-start mb-6 relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg z-10"
                style={{ backgroundColor: getActionColor(entry.action) }}
              >
                {getActionIcon(entry.action)}
              </div>
              
              <div className={`flex-1 ml-4 rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {formatted.message}
                </div>
                
                <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatted.time}
                </div>

                {formatted.changes.length > 0 && (
                  <div className="mt-3">
                    <details className="cursor-pointer">
                      <summary className={`text-sm font-medium py-2 px-3 rounded ${isDarkMode ? 'text-indigo-400 bg-indigo-900/20 border border-indigo-800' : 'text-indigo-600 bg-indigo-50 border border-indigo-200'} hover:opacity-80 transition-opacity`}>
                        Ver detalhes das mudanças
                      </summary>
                      <div className={`mt-2 p-3 rounded ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                        {formatted.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="flex items-center gap-2 mb-2 text-sm flex-wrap last:mb-0">
                            <strong className={`min-w-[80px] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              {change.field}:
                            </strong>
                            <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                              "{change.oldValue}"
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold">→</span>
                            <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                              "{change.newValue}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditHistory;
