// API com Firebase e fallback para localStorage
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { auditService } from './auditService';
import { authService } from './authService';

// Funções para localStorage (fallback)
const localStorageAPI = {
  // Computadores
  getComputadores: () => {
    const data = localStorage.getItem('computadores');
    return data ? JSON.parse(data) : [];
  },
  
  saveComputadores: (data) => {
    localStorage.setItem('computadores', JSON.stringify(data));
  },
  
  // Grupos
  getGrupos: () => {
    const data = localStorage.getItem('grupos');
    return data ? JSON.parse(data) : [];
  },
  
  saveGrupos: (data) => {
    localStorage.setItem('grupos', JSON.stringify(data));
  },
  
  // Histórico
  getHistorico: () => {
    const data = localStorage.getItem('historico');
    return data ? JSON.parse(data) : [];
  },
  
  saveHistorico: (data) => {
    localStorage.setItem('historico', JSON.stringify(data));
  }
};

// Operações de Computadores
export const computadoresAPI = {
  // Listar todos os computadores
  getAll: async () => {
    try {
      const computadoresRef = collection(db, 'computadores');
      const q = query(computadoresRef, orderBy('addedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar computadores do Firebase:', error);
      // Fallback para localStorage
      return localStorageAPI.getComputadores();
    }
  },

  // Buscar computador por ID
  getById: async (id) => {
    try {
      const computadores = localStorageAPI.getComputadores();
      const computador = computadores.find(c => c.id === parseInt(id));
      
      if (computador) {
        return computador;
      } else {
        throw new Error('Computador não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar computador:', error);
      throw error;
    }
  },

  // Adicionar novo computador
  add: async (data) => {
    try {
      // 🔥 Obter informações do usuário atual
      const currentUser = authService.getCurrentUser();
      const nomeGuerra = currentUser ? await authService.getNomeGuerra() : 'Usuário Desconhecido';
      
      const newComputerData = {
        ...data,
        addedAt: new Date().toISOString(),
        dataCadastro: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString(),
        userId: currentUser?.uid || null,  // 🔥 Salvar quem cadastrou
        cadastradoPor: nomeGuerra          // 🔥 Salvar nome de quem cadastrou
      };
      
      const computadoresRef = collection(db, 'computadores');
      const docRef = await addDoc(computadoresRef, newComputerData);

      // 🔥 IMPORTANTE: Também adicionar no localStorage para manter sincronizado
      const computadores = localStorageAPI.getComputadores();
      computadores.push({
        id: docRef.id,
        ...newComputerData
      });
      localStorageAPI.saveComputadores(computadores);

      // Registrar auditoria
      if (currentUser) {
        console.log('📝 Registrando auditoria - Usuário:', nomeGuerra, 'UID:', currentUser.uid);
        await auditService.logChange(
          'create',
          'computador',
          docRef.id,
          null,
          { ...data, id: docRef.id },
          currentUser.uid,
          nomeGuerra || currentUser.email || 'Usuário Desconhecido'
        );
      } else {
        console.warn('⚠️ Nenhum usuário autenticado para registrar auditoria');
      }

      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar computador no Firebase:', error);
      // Fallback para localStorage
      const computadores = localStorageAPI.getComputadores();
      const newId = computadores.length > 0 ? Math.max(...computadores.map(c => c.id)) + 1 : 1;
      const newComputer = {
        id: newId,
        ...data,
        dataCadastro: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      };
      computadores.push(newComputer);
      localStorageAPI.saveComputadores(computadores);

      // Registrar auditoria local
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const nomeGuerra = await authService.getNomeGuerra();
        auditService.logChangeLocal(
          'create',
          'computador',
          newId.toString(),
          null,
          newComputer,
          currentUser.uid,
          nomeGuerra
        );
      }

      return newId.toString();
    }
  },

  // Atualizar computador
  update: async (id, data) => {
    try {
      // Buscar dados antigos para auditoria
      const computadoresRef = collection(db, 'computadores');
      const q = query(computadoresRef, where('__name__', '==', id));
      const oldSnapshot = await getDocs(q);
      const oldData = oldSnapshot.docs[0]?.data();

      const computadorRef = doc(db, 'computadores', id);
      const newData = {
        ...data,
        ultimaAtualizacao: new Date().toISOString()
      };
      
      await updateDoc(computadorRef, newData);

      // 🔥 IMPORTANTE: Também atualizar no localStorage para manter sincronizado
      const computadores = localStorageAPI.getComputadores();
      const index = computadores.findIndex(c => c.id === id || c.id === parseInt(id));
      if (index !== -1) {
        computadores[index] = {
          ...computadores[index],
          ...newData
        };
        localStorageAPI.saveComputadores(computadores);
      }

      // Registrar auditoria
      const currentUser = authService.getCurrentUser();
      if (currentUser && oldData) {
        const nomeGuerra = await authService.getNomeGuerra();
        console.log('📝 Registrando auditoria UPDATE - Usuário:', nomeGuerra);
        await auditService.logChange(
          'update',
          'computador',
          id,
          oldData,
          { ...oldData, ...newData },
          currentUser.uid,
          nomeGuerra || currentUser.email || 'Usuário Desconhecido'
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar computador no Firebase:', error);
      // Fallback para localStorage
      const computadores = localStorageAPI.getComputadores();
      const index = computadores.findIndex(c => c.id === parseInt(id));
      
      if (index !== -1) {
        const oldData = computadores[index];
        computadores[index] = {
          ...computadores[index],
          ...data,
          ultimaAtualizacao: new Date().toISOString()
        };
        localStorageAPI.saveComputadores(computadores);

        // Registrar auditoria local
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const nomeGuerra = await authService.getNomeGuerra();
          auditService.logChangeLocal(
            'update',
            'computador',
            id,
            oldData,
            computadores[index],
            currentUser.uid,
            nomeGuerra
          );
        }

        return true;
      } else {
        throw new Error('Computador não encontrado');
      }
    }
  },

  // Deletar computador
  delete: async (id) => {
    try {
      // Buscar dados antes de deletar para auditoria
      const computadoresRef = collection(db, 'computadores');
      const q = query(computadoresRef, where('__name__', '==', id));
      const oldSnapshot = await getDocs(q);
      const oldData = oldSnapshot.docs[0]?.data();

      // 🔥 DELETAR HISTÓRICO DE AUDITORIA relacionado a este computador
      try {
        const auditRef = collection(db, 'audit_log');
        const auditQuery = query(
          auditRef,
          where('entityType', '==', 'computador'),
          where('entityId', '==', id)
        );
        const auditSnapshot = await getDocs(auditQuery);
        
        const deleteAuditPromises = auditSnapshot.docs.map(auditDoc => 
          deleteDoc(doc(db, 'audit_log', auditDoc.id))
        );
        await Promise.all(deleteAuditPromises);
        console.log(`🗑️ ${auditSnapshot.docs.length} registros de auditoria deletados para computador ${id}`);
      } catch (auditError) {
        console.error('⚠️ Erro ao deletar auditoria do computador:', auditError);
        // Continua mesmo se falhar ao deletar auditoria
      }

      // Deletar o computador
      const computadorRef = doc(db, 'computadores', id);
      await deleteDoc(computadorRef);

      // 🔥 IMPORTANTE: Também remover do localStorage para manter sincronizado
      const computadores = localStorageAPI.getComputadores();
      const filteredComputadores = computadores.filter(c => c.id !== id && c.id !== parseInt(id));
      localStorageAPI.saveComputadores(filteredComputadores);

      // Registrar auditoria de deleção (antes de deletar o histórico)
      const currentUser = authService.getCurrentUser();
      if (currentUser && oldData) {
        const nomeGuerra = await authService.getNomeGuerra();
        console.log('📝 Registrando auditoria DELETE - Usuário:', nomeGuerra);
        await auditService.logChange(
          'delete',
          'computador',
          id,
          oldData,
          null,
          currentUser.uid,
          nomeGuerra || currentUser.email || 'Usuário Desconhecido'
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar computador no Firebase:', error);
      // Fallback para localStorage
      const computadores = localStorageAPI.getComputadores();
      const oldData = computadores.find(c => c.id === parseInt(id));
      const filteredComputadores = computadores.filter(c => c.id !== parseInt(id));
      localStorageAPI.saveComputadores(filteredComputadores);

      // Registrar auditoria local
      const currentUser = authService.getCurrentUser();
      if (currentUser && oldData) {
        const nomeGuerra = await authService.getNomeGuerra();
        auditService.logChangeLocal(
          'delete',
          'computador',
          id,
          oldData,
          null,
          currentUser.uid,
          nomeGuerra
        );
      }

      return true;
    }
  },

  // Buscar por IP
  getByIP: async (ip) => {
    try {
      const computadores = localStorageAPI.getComputadores();
      return computadores.filter(c => c.ip === ip);
    } catch (error) {
      console.error('Erro ao buscar por IP:', error);
      throw error;
    }
  }
};

// Função para inicializar grupos baseados nos computadores reais
const initializeDefaultGroups = () => {
  // Carregar computadores existentes
  const computadores = localStorageAPI.getComputadores();
  
  // Extrair seções únicas dos computadores
  const secoesExistentes = [...new Set(computadores.map(comp => comp.secao || 'SEM SEÇÃO'))];
  
  // Criar grupos baseados nas seções reais dos computadores
  const gruposReais = secoesExistentes.map((secao, index) => {
    const computadoresDaSecao = computadores.filter(comp => (comp.secao || 'SEM SEÇÃO') === secao);
    // Extrair IPs e MACs únicos do grupo
    const ips = [...new Set(computadoresDaSecao.map(comp => comp.ip).filter(ip => ip))];
    const macs = [...new Set(computadoresDaSecao.map(comp => comp.macAddress).filter(mac => mac))];
    
    return {
      id: index + 1,
      nome: secao,
      descricao: `Equipamentos da seção ${secao}`,
      equipamento: computadoresDaSecao.map(comp => comp.nome),
      totalComputadores: computadoresDaSecao.length,
      ip: ips.length > 0 ? ips.join(', ') : '',
      mac: macs.length > 0 ? macs.join(', ') : ''
    };
  });

  // Se não há computadores, criar grupos padrão vazios
  if (gruposReais.length === 0) {
    const gruposPadrao = [
      { id: 1, nome: 'ALMOX', descricao: 'Equipamentos da seção ALMOX', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 2, nome: 'APROV', descricao: 'Equipamentos da seção APROV', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 3, nome: 'BA5', descricao: 'Equipamentos da seção BA5', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 4, nome: 'CMT', descricao: 'Equipamentos da seção CMT', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 5, nome: 'COMSOC', descricao: 'Equipamentos da seção COMSOC', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 6, nome: 'CONFORMIDADE', descricao: 'Equipamentos da seção CONFORMIDADE', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 7, nome: 'CS', descricao: 'Equipamentos da seção CS', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 8, nome: 'FISCADM', descricao: 'Equipamentos da seção FISCADM', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 9, nome: 'FUSEX', descricao: 'Equipamentos da seção FUSEX', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 10, nome: 'GARAGEM', descricao: 'Equipamentos da seção GARAGEM', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 11, nome: 'GPCOM', descricao: 'Equipamentos da seção GPCOM', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 12, nome: 'INFOR', descricao: 'Equipamentos da seção INFOR', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 13, nome: 'PDI', descricao: 'Equipamentos da seção PDI', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 14, nome: 'PELOTÃO', descricao: 'Equipamentos da seção PELOTÃO', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 15, nome: 'PIPA', descricao: 'Equipamentos da seção PIPA', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 16, nome: 'S1', descricao: 'Equipamentos da seção S1', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 17, nome: 'S2', descricao: 'Equipamentos da seção S2', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 18, nome: 'S3', descricao: 'Equipamentos da seção S3', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 19, nome: 'S4', descricao: 'Equipamentos da seção S4', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 20, nome: 'SALC', descricao: 'Equipamentos da seção SALC', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 21, nome: 'SAÚDE', descricao: 'Equipamentos da seção SAÚDE', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 22, nome: 'SEM SEÇÃO', descricao: 'Equipamentos da seção SEM SEÇÃO', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 23, nome: 'SFPC', descricao: 'Equipamentos da seção SFPC', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 24, nome: 'SPP', descricao: 'Equipamentos da seção SPP', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 25, nome: 'SUBTENÊNCIA', descricao: 'Equipamentos da seção SUBTENÊNCIA', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 26, nome: 'SVP', descricao: 'Equipamentos da seção SVP', equipamento: [], totalComputadores: 0, ip: '', mac: '' },
      { id: 27, nome: 'TESOURARIA', descricao: 'Equipamentos da seção TESOURARIA', equipamento: [], totalComputadores: 0, ip: '', mac: '' }
    ];
    localStorageAPI.saveGrupos(gruposPadrao);
    console.log('Grupos padrão inicializados:', gruposPadrao.length);
    return gruposPadrao;
  }

  // Salvar grupos baseados nos computadores reais
  localStorageAPI.saveGrupos(gruposReais);
  console.log('Grupos criados com base nos computadores reais:', gruposReais.length);
  
  return gruposReais;
};

// Operações de Grupos
export const gruposAPI = {
  // Listar todos os grupos
  getAll: async () => {
    try {
      const gruposRef = collection(db, 'grupos');
      const q = query(gruposRef, orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      const grupos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Se não há grupos no Firebase, inicializar grupos padrão
      if (grupos.length === 0) {
        return initializeDefaultGroups();
      }

      return grupos;
    } catch (error) {
      console.error('Erro ao buscar grupos do Firebase:', error);
      // Fallback para localStorage
      return initializeDefaultGroups();
    }
  },

  // Adicionar novo grupo
  add: async (data) => {
    try {
      const newGroupData = {
        ...data,
        dataCriacao: new Date().toISOString()
      };
      
      const gruposRef = collection(db, 'grupos');
      const docRef = await addDoc(gruposRef, newGroupData);
      
      // 🔥 IMPORTANTE: Também adicionar no localStorage para manter sincronizado
      const grupos = localStorageAPI.getGrupos();
      grupos.push({
        id: docRef.id,
        ...newGroupData
      });
      localStorageAPI.saveGrupos(grupos);
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar grupo no Firebase:', error);
      // Fallback para localStorage
      const grupos = localStorageAPI.getGrupos();
      const newId = grupos.length > 0 ? Math.max(...grupos.map(g => g.id)) + 1 : 1;
      const newGroup = {
        id: newId,
        ...data,
        dataCriacao: new Date().toISOString()
      };
      grupos.push(newGroup);
      localStorageAPI.saveGrupos(grupos);
      return newId.toString();
    }
  },

  // Atualizar grupo
  update: async (id, data) => {
    try {
      const grupoRef = doc(db, 'grupos', id);
      await updateDoc(grupoRef, data);
      
      // 🔥 IMPORTANTE: Também atualizar no localStorage para manter sincronizado
      const grupos = localStorageAPI.getGrupos();
      const index = grupos.findIndex(g => g.id === id || g.id === parseInt(id));
      if (index !== -1) {
        grupos[index] = {
          ...grupos[index],
          ...data
        };
        localStorageAPI.saveGrupos(grupos);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar grupo no Firebase:', error);
      // Fallback para localStorage
      const grupos = localStorageAPI.getGrupos();
      const index = grupos.findIndex(g => g.id === parseInt(id));
      
      if (index !== -1) {
        grupos[index] = {
          ...grupos[index],
          ...data
        };
        localStorageAPI.saveGrupos(grupos);
        return true;
      } else {
        throw new Error('Grupo não encontrado');
      }
    }
  },

  // Deletar grupo
  delete: async (id) => {
    try {
      const grupoRef = doc(db, 'grupos', id);
      await deleteDoc(grupoRef);
      
      // 🔥 IMPORTANTE: Também remover do localStorage para manter sincronizado
      const grupos = localStorageAPI.getGrupos();
      const filteredGrupos = grupos.filter(g => g.id !== id && g.id !== parseInt(id));
      localStorageAPI.saveGrupos(filteredGrupos);
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar grupo no Firebase:', error);
      // Fallback para localStorage
      const grupos = localStorageAPI.getGrupos();
      const filteredGrupos = grupos.filter(g => g.id !== parseInt(id));
      localStorageAPI.saveGrupos(filteredGrupos);
      return true;
    }
  }
};

// Operações de Histórico
export const historicoAPI = {
  // Buscar histórico de um computador
  getByComputadorId: async (computadorId) => {
    try {
      const historicoRef = collection(db, 'historico');
      const q = query(
        historicoRef, 
        where('computadorId', '==', computadorId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico do Firebase:', error);
      // Fallback para localStorage
      const historico = localStorageAPI.getHistorico();
      return historico
        .filter(h => h.computadorId === computadorId)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
  },

  // Adicionar registro no histórico
  add: async (data) => {
    try {
      const historicoRef = collection(db, 'historico');
      const docRef = await addDoc(historicoRef, {
        ...data,
        timestamp: new Date().toISOString(),
        data: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar histórico no Firebase:', error);
      // Fallback para localStorage
      const historico = localStorageAPI.getHistorico();
      const newId = historico.length > 0 ? Math.max(...historico.map(h => h.id)) + 1 : 1;
      const newRecord = {
        id: newId,
        ...data,
        data: new Date().toISOString()
      };
      historico.push(newRecord);
      localStorageAPI.saveHistorico(historico);
      return newId.toString();
    }
  }
};

// Export como named exports e default
const apiServices = { computadoresAPI, gruposAPI, historicoAPI };
export default apiServices;

