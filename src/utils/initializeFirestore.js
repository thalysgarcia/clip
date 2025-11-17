// Script para inicializar as coleções do Firestore
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const initializeFirestoreCollections = async () => {
  try {
    console.log('🔥 Inicializando coleções do Firestore...');

    // Verificar se as coleções já existem
    const computadoresRef = collection(db, 'computadores');
    const gruposRef = collection(db, 'grupos');
    const historicoRef = collection(db, 'historico');

    // Verificar computadores
    const computadoresSnapshot = await getDocs(computadoresRef);
    if (computadoresSnapshot.empty) {
      console.log('📊 Criando coleção computadores...');
      // A coleção será criada automaticamente quando o primeiro documento for adicionado
    } else {
      console.log('📊 Coleção computadores já existe');
    }

    // Verificar grupos
    const gruposSnapshot = await getDocs(gruposRef);
    if (gruposSnapshot.empty) {
      console.log('📋 Criando coleção grupos...');
      // Criar grupos padrão
      const gruposPadrao = [
        { nome: 'ALMOX', descricao: 'Equipamentos da seção ALMOX', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'APROV', descricao: 'Equipamentos da seção APROV', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'BA5', descricao: 'Equipamentos da seção BA5', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'CMT', descricao: 'Equipamentos da seção CMT', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'COMSOC', descricao: 'Equipamentos da seção COMSOC', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'CONFORMIDADE', descricao: 'Equipamentos da seção CONFORMIDADE', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'CS', descricao: 'Equipamentos da seção CS', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'FISCADM', descricao: 'Equipamentos da seção FISCADM', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'FUSEX', descricao: 'Equipamentos da seção FUSEX', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'GARAGEM', descricao: 'Equipamentos da seção GARAGEM', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'GPCOM', descricao: 'Equipamentos da seção GPCOM', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'INFOR', descricao: 'Equipamentos da seção INFOR', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'PDI', descricao: 'Equipamentos da seção PDI', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'PELOTÃO', descricao: 'Equipamentos da seção PELOTÃO', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'PIPA', descricao: 'Equipamentos da seção PIPA', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'S1', descricao: 'Equipamentos da seção S1', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'S2', descricao: 'Equipamentos da seção S2', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'S3', descricao: 'Equipamentos da seção S3', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'S4', descricao: 'Equipamentos da seção S4', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SALC', descricao: 'Equipamentos da seção SALC', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SAÚDE', descricao: 'Equipamentos da seção SAÚDE', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SEM SEÇÃO', descricao: 'Equipamentos da seção SEM SEÇÃO', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SFPC', descricao: 'Equipamentos da seção SFPC', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SPP', descricao: 'Equipamentos da seção SPP', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SUBTENÊNCIA', descricao: 'Equipamentos da seção SUBTENÊNCIA', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'SVP', descricao: 'Equipamentos da seção SVP', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() },
        { nome: 'TESOURARIA', descricao: 'Equipamentos da seção TESOURARIA', equipamento: [], totalComputadores: 0, ip: '', mac: '', dataCriacao: new Date().toISOString() }
      ];

      // Adicionar grupos padrão
      for (const grupo of gruposPadrao) {
        await addDoc(gruposRef, grupo);
      }
      console.log('✅ Grupos padrão criados com sucesso!');
    } else {
      console.log('📋 Coleção grupos já existe');
    }

    // Verificar histórico
    const historicoSnapshot = await getDocs(historicoRef);
    if (historicoSnapshot.empty) {
      console.log('📝 Coleção histórico será criada automaticamente quando necessário');
    } else {
      console.log('📝 Coleção histórico já existe');
    }

    console.log('🎉 Inicialização do Firestore concluída!');
    return true;

  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error);
    return false;
  }
};
