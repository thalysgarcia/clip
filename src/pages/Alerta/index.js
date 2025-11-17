import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';
import { computadoresAPI } from '../../services/api';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminButton, AdminCard } from '../../components/admin/AdminComponents';

function Alerta() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [computadores, setComputadores] = useState([]);
  const [gruposDuplicacao, setGruposDuplicacao] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(null); // 'password' or 'delete'
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const loadUser = async () => {
      const userObj = JSON.parse(userData);
      // Buscar nome de guerra atualizado do Firestore
      try {
        const nomeGuerra = await authService.getNomeGuerra();
        if (nomeGuerra && nomeGuerra !== 'Usuário Anônimo') {
          userObj.nomeGuerra = nomeGuerra;
          userObj.name = nomeGuerra;
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
        } else {
          setUser(userObj);
        }
      } catch (error) {
        console.error('Erro ao carregar nome de guerra:', error);
        setUser(userObj);
      }
    };
    
    loadUser();
    loadData();
  }, [navigate]);


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
        problemas.push(`IP ${comps[0].ip} duplicado`);
      }
      
      // Verificar MACs duplicados
      const macDuplicado = comps.every(comp => macMap[comp.macAddress] && macMap[comp.macAddress].length > 1);
      if (macDuplicado) {
        problemas.push(`MAC ${comps[0].macAddress} duplicado`);
      }
      
      // Verificar Lacres duplicados
      const lacreDuplicado = comps.every(comp => lacreMap[comp.lacre] && lacreMap[comp.lacre].length > 1);
      if (lacreDuplicado) {
        problemas.push(`Lacre ${comps[0].lacre} duplicado`);
      }
      
      return problemas;
    };

    // Identificar grupos com IPs duplicados
    Object.entries(ipMap).forEach(([ip, comps]) => {
      if (comps.length > 1) {
        const problemas = detectarProblemas(comps);
        
        grupos.push({
          tipo: 'Múltiplos',
          valor: `${comps.length} computadores`,
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
          tipo: 'Múltiplos',
          valor: `${comps.length} computadores`,
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
          tipo: 'Múltiplos',
          valor: `${comps.length} computadores`,
          computadores: comps,
          problema: problemas.join(', '),
          problemas: problemas
        });
      }
    });

    setGruposDuplicacao(grupos);
    return grupos.length;
  };

  const loadData = () => {
    const storedComputadores = localStorage.getItem('computadores');
    
    let data = [];
    if (storedComputadores) {
      data = JSON.parse(storedComputadores);
    }
    
    setComputadores(data);
    detectarDuplicatas(data);
  };

  const handleEditGroup = (grupo) => {
    setEditingGroup(grupo);
    setEditForm({
      [grupo.computadores[0].id]: {
        ip: grupo.computadores[0].ip,
        macAddress: grupo.computadores[0].macAddress,
        lacre: grupo.computadores[0].lacre
      },
      [grupo.computadores[1].id]: {
        ip: grupo.computadores[1].ip,
        macAddress: grupo.computadores[1].macAddress,
        lacre: grupo.computadores[1].lacre
      }
    });
  };

  const handleInputChange = (computerId, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [computerId]: {
        ...prev[computerId],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (!editingGroup) return;

    // Verificar se ainda há duplicações após as mudanças
    const updatedComputadores = computadores.map(comp => {
      if (editForm[comp.id]) {
        return { ...comp, ...editForm[comp.id] };
      }
      return comp;
    });

    // Verificar duplicações
    const ipMap = {};
    const macMap = {};
    const lacreMap = {};

    updatedComputadores.forEach(comp => {
      if (!ipMap[comp.ip]) ipMap[comp.ip] = [];
      ipMap[comp.ip].push(comp);
      
      if (!macMap[comp.macAddress]) macMap[comp.macAddress] = [];
      macMap[comp.macAddress].push(comp);
      
      if (!lacreMap[comp.lacre]) lacreMap[comp.lacre] = [];
      lacreMap[comp.lacre].push(comp);
    });

    // Verificar se ainda há duplicações no grupo atual
    const currentGroup = editingGroup;
    let stillDuplicated = false;

    // Verificar todos os tipos de problemas
    currentGroup.problemas.forEach(problema => {
      if (problema.includes('IP')) {
        const ip1 = editForm[currentGroup.computadores[0].id].ip;
        const ip2 = editForm[currentGroup.computadores[1].id].ip;
        if (ipMap[ip1]?.length > 1 || ipMap[ip2]?.length > 1) {
          stillDuplicated = true;
        }
      }
      if (problema.includes('MAC')) {
        const mac1 = editForm[currentGroup.computadores[0].id].macAddress;
        const mac2 = editForm[currentGroup.computadores[1].id].macAddress;
        if (macMap[mac1]?.length > 1 || macMap[mac2]?.length > 1) {
          stillDuplicated = true;
        }
      }
      if (problema.includes('Lacre')) {
        const lacre1 = editForm[currentGroup.computadores[0].id].lacre;
        const lacre2 = editForm[currentGroup.computadores[1].id].lacre;
        if (lacreMap[lacre1]?.length > 1 || lacreMap[lacre2]?.length > 1) {
          stillDuplicated = true;
        }
      }
    });

    if (stillDuplicated) {
      toast.warning('Ainda há duplicação! Verifique os valores inseridos.');
      return;
    }

    // Persistir mudanças no backend (com auditoria) e sincronizar local
    try {
      const ids = Object.keys(editForm);
      for (const id of ids) {
        const changes = editForm[id];
        await computadoresAPI.update(id.toString(), changes);
      }

      setComputadores(updatedComputadores);
      localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
      loadData();
      setEditingGroup(null);
      setEditForm({});
      toast.success('Alterações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      toast.error('Erro ao salvar alterações. Tente novamente.');
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditForm({});
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleOpenModal = (type) => {
    setShowModal(type);
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres!');
      return;
    }
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      handleCloseModal();
      toast.success('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Senha atual incorreta!');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A nova senha é muito fraca!');
      } else {
        toast.error('Erro ao trocar senha. Tente novamente.');
      }
    }
  };

  const handleDeleteEquipment = (equipment) => {
    setEquipmentToDelete(equipment);
    setShowModal('delete');
  };

  const confirmDelete = async () => {
    if (!equipmentToDelete) return;
    
    try {
      await computadoresAPI.delete(equipmentToDelete.id.toString());
      
      // Atualizar lista local
      const updatedComputadores = computadores.filter(comp => comp.id !== equipmentToDelete.id);
      setComputadores(updatedComputadores);
      localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
      
      // Recarregar dados
      loadData();
      setShowModal(null);
      setEquipmentToDelete(null);
      setSelectedAlert(null);
      setEditingGroup(null);
      
      toast.success(`Equipamento ${equipmentToDelete.nome} excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Erro ao excluir equipamento. Tente novamente.');
    }
  };

  const handleSelectAlert = (grupo) => {
    setSelectedAlert(grupo);
    setEditingGroup(null);
    setCompareMode(false);
    setSelectedForCompare([]);
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedForCompare([]);
  };

  const handleSelectForCompare = (comp) => {
    if (selectedForCompare.find(c => c.id === comp.id)) {
      setSelectedForCompare(selectedForCompare.filter(c => c.id !== comp.id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, comp]);
    } else {
      toast.warning('Você pode comparar no máximo 2 equipamentos!');
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <AdminDashboard currentPage="alerta">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              🚨 Central de Alertas
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detecte e resolva problemas de duplicação
            </p>
          </div>
          <div className="flex gap-3">
            {selectedAlert && !compareMode && (
              <AdminButton variant="secondary" onClick={toggleCompareMode}>
                🔄 Modo Comparação
              </AdminButton>
            )}
            {compareMode && (
              <AdminButton variant="secondary" onClick={toggleCompareMode}>
                ✕ Sair da Comparação
              </AdminButton>
            )}
          </div>
        </div>

        <div>
          {gruposDuplicacao.length === 0 ? (
            <AdminCard>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Nenhum Alerta Detectado!</h2>
                <p className="text-gray-600 dark:text-gray-400">Todos os equipamentos estão com configurações únicas e corretas.</p>
              </div>
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Alertas */}
              <AdminCard className="lg:col-span-1">
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📋 Alertas ({gruposDuplicacao.length})</h3>
                    <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
                      {gruposDuplicacao.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {gruposDuplicacao.map((grupo, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAlert === grupo
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSelectAlert(grupo)}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">⚠️</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Alerta #{index + 1}</span>
                      </div>
                      <div className="ml-8">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {grupo.problemas.map((prob, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-medium"
                            >
                              {prob}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {grupo.computadores.length} equipamento{grupo.computadores.length > 1 ? 's' : ''} afetado{grupo.computadores.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* Detalhes do Alerta */}
              <AdminCard className="lg:col-span-2">
                {selectedAlert ? (
                  <div>
                    {/* Header com ações */}
                    <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">⚠️ Detalhes do Alerta</h2>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-semibold">
                          Alta Prioridade
                        </span>
                      </div>
                    </div>

                    {/* Problemas Detectados */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">🔍 Problemas Detectados</h3>
                      <div className="space-y-2">
                        {selectedAlert.problemas.map((problema, idx) => (
                          <div key={idx} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <span className="text-lg mr-3">🚨</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">{problema}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modo Comparação */}
                    {compareMode && (
                      <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg text-center">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {selectedForCompare.length === 0 && '👇 Selecione até 2 equipamentos para comparar'}
                          {selectedForCompare.length === 1 && '✅ 1 equipamento selecionado. Selecione mais um!'}
                          {selectedForCompare.length === 2 && '✅ 2 equipamentos selecionados. Veja a comparação abaixo!'}
                        </p>
                      </div>
                    )}

                    {/* Lista de Equipamentos Afetados */}
                    {!compareMode ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">💻 Equipamentos Afetados</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedAlert.computadores.map((comp) => (
                            <AdminCard key={comp.id}>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{comp.nome}</h4>
                                <AdminButton
                                  variant="danger"
                                  onClick={() => handleDeleteEquipment(comp)}
                                  className="p-2"
                                >
                                  🗑️
                                </AdminButton>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IP:</span>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{comp.ip}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MAC:</span>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{comp.macAddress}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lacre:</span>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{comp.lacre}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Seção:</span>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{comp.secao || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{comp.tipo || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="mt-4">
                                <AdminButton
                                  variant="secondary"
                                  onClick={() => handleEditGroup(selectedAlert)}
                                  className="w-full"
                                >
                                  ✏️ Editar
                                </AdminButton>
                              </div>
                            </AdminCard>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">💻 Selecione Equipamentos para Comparar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {selectedAlert.computadores.map((comp) => {
                            const isSelected = selectedForCompare.find(c => c.id === comp.id);
                            return (
                              <div
                                key={comp.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600 shadow-md'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                                onClick={() => handleSelectForCompare(comp)}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{comp.nome}</h4>
                                  {isSelected && (
                                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">IP:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{comp.ip}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">MAC:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{comp.macAddress}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Lacre:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{comp.lacre}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Comparação lado a lado */}
                        {selectedForCompare.length === 2 && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">🔄 Comparação Detalhada</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedForCompare.map((comp, idx) => (
                                <AdminCard key={comp.id}>
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{comp.nome}</h4>
                                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded text-xs font-medium">
                                      #{idx + 1}
                                    </span>
                                  </div>
                                  <div className="space-y-2 mb-4">
                                    <div className={`flex justify-between py-2 border-b ${
                                      selectedForCompare[0].ip === selectedForCompare[1].ip
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IP:</span>
                                      <span className={`text-sm font-medium ${
                                        selectedForCompare[0].ip === selectedForCompare[1].ip
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>{comp.ip}</span>
                                    </div>
                                    <div className={`flex justify-between py-2 border-b ${
                                      selectedForCompare[0].macAddress === selectedForCompare[1].macAddress
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MAC:</span>
                                      <span className={`text-sm font-medium ${
                                        selectedForCompare[0].macAddress === selectedForCompare[1].macAddress
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>{comp.macAddress}</span>
                                    </div>
                                    <div className={`flex justify-between py-2 border-b ${
                                      selectedForCompare[0].lacre === selectedForCompare[1].lacre
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lacre:</span>
                                      <span className={`text-sm font-medium ${
                                        selectedForCompare[0].lacre === selectedForCompare[1].lacre
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>{comp.lacre}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Seção:</span>
                                      <span className="text-sm text-gray-900 dark:text-gray-100">{comp.secao || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                                      <span className="text-sm text-gray-900 dark:text-gray-100">{comp.tipo || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <AdminButton
                                    variant="danger"
                                    onClick={() => handleDeleteEquipment(comp)}
                                    className="w-full"
                                  >
                                    🗑️ Excluir
                                  </AdminButton>
                                </AdminCard>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Modal de Edição */}
                    {editingGroup && (
                      <div className="edit-modal-overlay" onClick={handleCancelEdit}>
                        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                          <div className="edit-modal-header">
                            <h3>✏️ Editar Equipamentos</h3>
                            <button className="btn-close" onClick={handleCancelEdit}>✕</button>
                          </div>
                          <div className="edit-modal-body">
                            <div className="edit-grid">
                              {editingGroup.computadores.map((comp) => (
                                <div key={comp.id} className="edit-card">
                                  <h4>{comp.nome}</h4>
                                  <div className="form-group">
                                    <label>IP:</label>
                                    <input
                                      type="text"
                                      value={editForm[comp.id]?.ip || ''}
                                      onChange={(e) => handleInputChange(comp.id, 'ip', e.target.value)}
                                      className={editingGroup.problemas.some(p => p.includes('IP')) ? 'highlight' : ''}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>MAC:</label>
                                    <input
                                      type="text"
                                      value={editForm[comp.id]?.macAddress || ''}
                                      onChange={(e) => handleInputChange(comp.id, 'macAddress', e.target.value)}
                                      className={editingGroup.problemas.some(p => p.includes('MAC')) ? 'highlight' : ''}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Lacre:</label>
                                    <input
                                      type="text"
                                      value={editForm[comp.id]?.lacre || ''}
                                      onChange={(e) => handleInputChange(comp.id, 'lacre', e.target.value)}
                                      className={editingGroup.problemas.some(p => p.includes('Lacre')) ? 'highlight' : ''}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="edit-modal-footer">
                            <button className="btn-cancel" onClick={handleCancelEdit}>
                              ❌ Cancelar
                            </button>
                            <button className="btn-save" onClick={handleSaveChanges}>
                              💾 Salvar Alterações
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Selecione um Alerta</h3>
                    <p className="text-gray-600 dark:text-gray-400">Escolha um alerta da lista ao lado para visualizar os detalhes e tomar ações.</p>
                  </div>
                )}
              </AdminCard>
            </div>
          )}
        </div>

        {/* Modal de Trocar Senha */}
      {showModal === 'password' && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content config-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Trocar Senha</h2>
            <form onSubmit={handleSubmitPassword}>
              <div className="form-group">
                <label>Senha Atual</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Digite sua senha atual"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirme sua nova senha"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showModal === 'delete' && equipmentToDelete && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h2>Confirmar Exclusão</h2>
            <p className="delete-warning">
              Você está prestes a excluir o equipamento:
            </p>
            <div className="equipment-to-delete">
              <h3>{equipmentToDelete.nome}</h3>
              <div className="delete-details">
                <p><strong>IP:</strong> {equipmentToDelete.ip}</p>
                <p><strong>MAC:</strong> {equipmentToDelete.macAddress}</p>
                <p><strong>Lacre:</strong> {equipmentToDelete.lacre}</p>
              </div>
            </div>
            <p className="delete-warning-text">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                className="btn-delete-confirm"
              >
                🗑️ Excluir Equipamento
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminDashboard>
  );
}

export default Alerta;
