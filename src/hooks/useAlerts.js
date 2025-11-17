import { useState, useEffect } from 'react';
import { computadoresAPI } from '../services/api';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const detectarDuplicatas = (data) => {
    const ipMap = {};
    const macMap = {};
    const lacreMap = {};
    const grupos = [];

    // Mapear computadores por IP, MAC e Lacre
    data.forEach(comp => {
      if (!ipMap[comp.ip]) ipMap[comp.ip] = [];
      ipMap[comp.ip].push(comp);
      
      if (!macMap[comp.macAddress]) macMap[comp.macAddress] = [];
      macMap[comp.macAddress].push(comp);
      
      if (!lacreMap[comp.lacre]) lacreMap[comp.lacre] = [];
      lacreMap[comp.lacre].push(comp);
    });

    // Função para detectar todos os problemas de um grupo de computadores
    const detectarProblemas = (comps) => {
      const problemas = [];
      
      // Verificar IPs duplicados
      const ipDuplicado = comps.every(comp => ipMap[comp.ip] && ipMap[comp.ip].length > 1);
      if (ipDuplicado) {
        problemas.push('IP Duplicado');
      }
      
      // Verificar MACs duplicados
      const macDuplicado = comps.every(comp => macMap[comp.macAddress] && macMap[comp.macAddress].length > 1);
      if (macDuplicado) {
        problemas.push('MAC Duplicado');
      }
      
      // Verificar Lacres duplicados
      const lacreDuplicado = comps.every(comp => lacreMap[comp.lacre] && lacreMap[comp.lacre].length > 1);
      if (lacreDuplicado) {
        problemas.push('Lacre Duplicado');
      }
      
      return problemas;
    };

    // Identificar grupos com IPs duplicados
    Object.entries(ipMap).forEach(([ip, comps]) => {
      if (comps.length > 1) {
        const problemas = detectarProblemas(comps);
        
        grupos.push({
          tipo: 'IP Duplicado',
          valor: ip,
          computadores: comps,
          problema: problemas.join(', '),
          problemas: problemas
        });
      }
    });

    // Identificar grupos com MACs duplicados
    Object.entries(macMap).forEach(([mac, comps]) => {
      if (comps.length > 1) {
        const problemas = detectarProblemas(comps);
        
        grupos.push({
          tipo: 'MAC Duplicado',
          valor: mac,
          computadores: comps,
          problema: problemas.join(', '),
          problemas: problemas
        });
      }
    });

    // Identificar grupos com Lacres duplicados
    Object.entries(lacreMap).forEach(([lacre, comps]) => {
      if (comps.length > 1) {
        const problemas = detectarProblemas(comps);
        
        grupos.push({
          tipo: 'Lacre Duplicado',
          valor: lacre,
          computadores: comps,
          problema: problemas.join(', '),
          problemas: problemas
        });
      }
    });

    return grupos;
  };

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        // Tentar carregar da API primeiro
        let computadores = [];
        try {
          computadores = await computadoresAPI.getAll();
        } catch (apiError) {
          // Fallback para localStorage se a API falhar
          const storedComputadores = localStorage.getItem('computadores');
          if (storedComputadores) {
            computadores = JSON.parse(storedComputadores);
          }
        }
        
        const gruposDuplicacao = detectarDuplicatas(computadores);
        setAlerts(gruposDuplicacao);
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
    
    // Atualizar alertas a cada 30 segundos
    const interval = setInterval(loadAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { alerts, loading, alertCount: alerts.length };
}

