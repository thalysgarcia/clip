// Serviço de Auditoria para rastrear mudanças no CLIP
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const auditService = {
  // Registrar uma mudança no histórico
  async logChange(action, entityType, entityId, oldData, newData, userId, userName) {
    try {
      const auditRef = collection(db, 'audit_log');
      
      const auditEntry = {
        action, // 'create', 'update', 'delete'
        entityType, // 'computador', 'grupo', 'usuario'
        entityId,
        oldData: oldData || null,
        newData: newData || null,
        userId,
        userName: userName || 'Usuário Desconhecido',
        timestamp: new Date().toISOString(),
        changes: this.calculateChanges(oldData, newData)
      };

      console.log('📝 Salvando auditoria:', {
        action,
        entityType,
        entityId,
        userName: auditEntry.userName,
        userId
      });

      const docRef = await addDoc(auditRef, auditEntry);
      console.log('✅ Auditoria registrada com sucesso:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria:', error);
      // Fallback para localStorage
      this.logChangeLocal(action, entityType, entityId, oldData, newData, userId, userName);
    }
  },

  // Calcular as mudanças específicas entre dados antigos e novos
  calculateChanges(oldData, newData) {
    if (!oldData || !newData) return [];

    const changes = [];
    const fields = ['nome', 'ip', 'macAddress', 'lacre', 'secao', 'status', 'tipo'];

    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field] || '',
          newValue: newData[field] || ''
        });
      }
    });

    return changes;
  },

  // Fallback para localStorage
  logChangeLocal(action, entityType, entityId, oldData, newData, userId, userName) {
    try {
      const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
      
      const auditEntry = {
        id: Date.now().toString(),
        action,
        entityType,
        entityId,
        oldData: oldData || null,
        newData: newData || null,
        userId,
        userName,
        timestamp: new Date().toISOString(),
        changes: this.calculateChanges(oldData, newData)
      };

      auditLog.push(auditEntry);
      localStorage.setItem('audit_log', JSON.stringify(auditLog));
      console.log('📝 Auditoria salva localmente');
    } catch (error) {
      console.error('❌ Erro ao salvar auditoria local:', error);
    }
  },

  // Buscar histórico de mudanças de um equipamento específico
  async getEquipmentHistory(equipmentId) {
    try {
      const auditRef = collection(db, 'audit_log');
      const q = query(
        auditRef,
        where('entityType', '==', 'computador'),
        where('entityId', '==', equipmentId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Fallback: se vazio no Firestore, tentar histórico local
      if (results.length === 0) {
        return this.getEquipmentHistoryLocal(equipmentId);
      }
      return results;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      // Fallback para localStorage
      return this.getEquipmentHistoryLocal(equipmentId);
    }
  },

  // Fallback para buscar histórico local
  getEquipmentHistoryLocal(equipmentId) {
    try {
      const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
      return auditLog
        .filter(entry => entry.entityType === 'computador' && entry.entityId === equipmentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('❌ Erro ao buscar histórico local:', error);
      return [];
    }
  },

  // Buscar todas as mudanças de um usuário
  async getUserActivity(userId) {
    try {
      const auditRef = collection(db, 'audit_log');
      const q = query(
        auditRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar atividade do usuário:', error);
      return [];
    }
  },

  // Buscar todas as mudanças recentes
  async getRecentActivity(limit = 50) {
    try {
      const auditRef = collection(db, 'audit_log');
      const q = query(
        auditRef,
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
      // Se não houver resultados no Firestore, buscar do localStorage
      if (results.length === 0) {
        return this.getRecentActivityLocal(limit);
      }
      
      return results;
    } catch (error) {
      console.error('❌ Erro ao buscar atividade recente:', error);
      // Fallback para localStorage
      return this.getRecentActivityLocal(limit);
    }
  },

  // Fallback para buscar atividade recente local
  getRecentActivityLocal(limit = 50) {
    try {
      const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
      return auditLog
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar atividade local:', error);
      return [];
    }
  },

  // Formatar mudança para exibição
  formatChange(auditEntry) {
    const { action, entityType, changes, userName, timestamp } = auditEntry;
    
    let message = '';
    const time = new Date(timestamp).toLocaleString('pt-BR');

    switch (action) {
      case 'create':
        message = `${userName} criou um novo ${entityType}`;
        break;
      case 'update':
        if (changes && changes.length > 0) {
          const changeText = changes.map(change => 
            `${change.field}: "${change.oldValue}" → "${change.newValue}"`
          ).join(', ');
          message = `${userName} alterou ${entityType}: ${changeText}`;
        } else {
          message = `${userName} atualizou ${entityType}`;
        }
        break;
      case 'delete':
        message = `${userName} excluiu ${entityType}`;
        break;
      default:
        message = `${userName} executou ação em ${entityType}`;
    }

    return {
      message,
      time,
      userName,
      action,
      changes: changes || []
    };
  }
};
