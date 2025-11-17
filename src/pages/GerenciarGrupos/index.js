import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gruposAPI } from '../../services/api';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminModal, AdminInput, AdminButton, AdminTextarea } from '../../components/admin/AdminComponents';

function GerenciarGrupos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showGrupoModal, setShowGrupoModal] = useState(false);
  const [showTipoFormModal, setShowTipoFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTipo, setIsEditingTipo] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTipoId, setEditingTipoId] = useState(null);
  const [draggedComputer, setDraggedComputer] = useState(null);
  const [draggedFromGroup, setDraggedFromGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    equipamento: [],
    ip: '',
    mac: '',
    cor: '#4ECDC4'
  });
  const [tipoFormData, setTipoFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#4ECDC4'
  });
  const [nameFormData, setNameFormData] = useState({
    name: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadGrupos();
    loadTipos();
  }, [navigate]);


  useEffect(() => {
    // Recarregar grupos quando a página ganhar foco (para atualizar contagens)
    const handleFocus = () => {
      loadGrupos();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Atualizar quando outra aba alterar os grupos via localStorage
    const handleStorage = (event) => {
      if (event.key === 'grupos') {
        loadGrupos();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Paleta CLIP - cores que funcionam bem em dark e light mode
  const CLIP_COLOR_PALETTE = [
    '#4ECDC4', // Turquesa CLIP (primary)
    '#3aaaa3', // Turquesa escuro (primary-dark)
    '#95B8D1', // Azul claro (accent)
    '#5B9BD5', // Azul médio
    '#70AD47', // Verde suave
    '#A5A5A5', // Cinza neutro
    '#FFC000', // Amarelo dourado
    '#E74C3C', // Vermelho suave
    '#9B59B6', // Roxo suave
    '#3498DB', // Azul claro
    '#16A085', // Verde água
    '#F39C12', // Laranja suave
    '#1ABC9C', // Turquesa médio
    '#34495E', // Azul acinzentado
    '#E67E22', // Laranja escuro
    '#2ECC71', // Verde esmeralda
    '#8E44AD', // Roxo médio
    '#27AE60', // Verde escuro
  ];

  // Mapeamento de seções conhecidas para cores específicas
  const SECTION_COLOR_MAP = {
    'ALMOX': '#9B59B6',      // Roxo suave
    'APROV': '#FFC000',      // Amarelo dourado
    'BA5': '#F39C12',        // Laranja suave
    'CMT': '#E74C3C',        // Vermelho suave
    'COMSOC': '#E67E22',     // Laranja escuro
    'CONF': '#3498DB',       // Azul claro
    'CONFORMIDADE': '#3498DB', // Azul claro
    'CS': '#8E44AD',         // Roxo médio
    'FISCADM': '#2ECC71',    // Verde esmeralda
    'FUSEX': '#16A085',      // Verde água
    'GARAG': '#5B9BD5',      // Azul médio
    'GARAGEM': '#5B9BD5',    // Azul médio
    'INFOR': '#1ABC9C',      // Turquesa médio
    'PELOTÃO': '#34495E',     // Azul acinzentado
    'PIPA': '#27AE60',       // Verde escuro
    'SAÚDE': '#E74C3C',      // Vermelho suave
    'SALC': '#95B8D1',       // Azul claro (accent)
    'SCMT': '#3aaaa3',       // Turquesa escuro
    'S1': '#4ECDC4',         // Turquesa CLIP
    'S2': '#70AD47',         // Verde suave
    'S3': '#A5A5A5',         // Cinza neutro
    'S4': '#9B59B6',         // Roxo suave
    'SEM SEÇÃO': '#A5A5A5',  // Cinza neutro
  };

  const generateColorFromName = (name) => {
    if (!name) return CLIP_COLOR_PALETTE[0];
    
    // Normalizar nome da seção
    const normalizedName = (name || '').trim().toUpperCase();
    
    // Verificar se há mapeamento direto
    if (SECTION_COLOR_MAP[normalizedName]) {
      return SECTION_COLOR_MAP[normalizedName];
    }
    
    // Para seções não mapeadas, gerar cor consistente baseada no hash do nome
    // mas usando a paleta CLIP
    let hash = 0;
    for (let i = 0; i < normalizedName.length; i++) {
      hash = normalizedName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CLIP_COLOR_PALETTE.length;
    return CLIP_COLOR_PALETTE[index];
  };

  // Utilitários de cor para estilizar as "pílulas" de seção
  const normalizeHex = (hex) => {
    if (!hex) return '#4ECDC4';
    const h = hex.trim();
    if (h.startsWith('#') && h.length === 4) {
      return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return h;
  };

  const darkenColor = (hex, amount = 25) => {
    const h = normalizeHex(hex).replace('#', '');
    const num = parseInt(h, 16);
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00ff) - amount;
    let b = (num & 0x0000ff) - amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getReadableTextColor = (hex) => {
    // Sempre retornar branco para seguir o padrão do light mode e dark mode
    return '#ffffff';
  };

  // Retorna a cor configurada para a seção usando a paleta CLIP (mesma função do Dashboard e Equipamentos)
  const getSecaoColor = (secaoNome) => {
    if (!secaoNome) return CLIP_COLOR_PALETTE[0];
    
    // Primeiro, tentar buscar a cor do grupo (se foi configurada manualmente)
    const grupo = grupos.find((g) => (g.nome || '').trim() === (secaoNome || '').trim());
    if (grupo?.cor) {
      return grupo.cor;
    }
    
    // Normalizar nome da seção
    const normalizedName = (secaoNome || '').trim().toUpperCase();
    
    // Verificar se há mapeamento direto
    if (SECTION_COLOR_MAP[normalizedName]) {
      return SECTION_COLOR_MAP[normalizedName];
    }
    
    // Para seções não mapeadas, gerar cor consistente baseada no hash do nome
    let hash = 0;
    for (let i = 0; i < normalizedName.length; i++) {
      hash = normalizedName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CLIP_COLOR_PALETTE.length;
    return CLIP_COLOR_PALETTE[index];
  };

  const loadGrupos = async () => {
    try {
      const gruposData = await gruposAPI.getAll();
      // Remover duplicados por nome (ignora maiúsc./minúsc. e espaços)
      const seen = new Map();
      const toDelete = [];
      gruposData.forEach(g => {
        const key = (g.nome || '').trim().toLowerCase();
        if (!key) return;
        if (seen.has(key)) {
          toDelete.push(g.id);
        } else {
          seen.set(key, g.id);
        }
      });

      if (toDelete.length > 0) {
        // Excluir duplicados na origem
        for (const id of toDelete) {
          try { await gruposAPI.delete(id); } catch (e) { console.error('Erro ao excluir duplicado', id, e); }
        }
        // Atualizar lista local mantendo apenas o primeiro de cada nome
        const deduped = gruposData.filter(g => !toDelete.includes(g.id));
        setGrupos(deduped);
        toast.info(`${toDelete.length} seção(ões) duplicada(s) excluída(s).`);
      } else {
        // Atribuir SEMPRE uma cor única e previsível por nome da seção
        const withColors = await Promise.all(gruposData.map(async (g) => {
          const corGerada = generateColorFromName(g.nome || 'seção');
          if (g.cor !== corGerada) {
            try { await gruposAPI.update(g.id.toString(), { cor: corGerada }); } catch (e) { console.error('Erro ao salvar cor da seção', g.id, e); }
            return { ...g, cor: corGerada };
          }
          return g;
        }));
        setGrupos(withColors);
      }
    } catch (error) {
      console.error('Erro ao carregar seções:', error);
      toast.error('Erro ao carregar seções');
    }
  };

  const loadTipos = () => {
    const storedTipos = localStorage.getItem('tipos');
    if (storedTipos) {
      setTipos(JSON.parse(storedTipos));
    } else {
      // Tipos padrão se não existirem
      const tiposPadrao = [
        { id: 1, nome: 'Servidor', descricao: 'Servidores e equipamentos críticos', cor: '#e74c3c' },
        { id: 2, nome: 'Estação de Trabalho', descricao: 'Computadores de usuários finais', cor: '#3498db' },
        { id: 3, nome: 'Impressora', descricao: 'Impressoras e equipamentos de impressão', cor: '#9b59b6' },
        { id: 4, nome: 'Câmera', descricao: 'Câmeras de segurança e monitoramento', cor: '#f39c12' },
        { id: 5, nome: 'Switch', descricao: 'Equipamentos de rede e switches', cor: '#2ecc71' }
      ];
      setTipos(tiposPadrao);
      localStorage.setItem('tipos', JSON.stringify(tiposPadrao));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Atualizar grupo existente
      const updatedGrupos = grupos.map(grupo => 
        grupo.id === editingId 
          ? {
              ...grupo,
              nome: formData.nome,
              descricao: formData.descricao,
              equipamento: formData.equipamento || [],
              totalComputadores: (formData.equipamento || []).length,
              ip: formData.ip || '',
              mac: formData.mac || '',
              cor: formData.cor || generateColorFromName(formData.nome)
            }
          : grupo
      );
      
      setGrupos(updatedGrupos);
      await gruposAPI.update(editingId, {
        nome: formData.nome,
        descricao: formData.descricao,
        equipamento: formData.equipamento || [],
        totalComputadores: (formData.equipamento || []).length,
        ip: formData.ip || '',
        mac: formData.mac || '',
        cor: formData.cor || generateColorFromName(formData.nome)
      });
      toast.success('Seção atualizada com sucesso!');
    } else {
      // Criar novo grupo
      const newGroup = {
        id: grupos.length + 1,
        nome: formData.nome,
        descricao: formData.descricao,
        equipamento: formData.equipamento || [],
        totalComputadores: (formData.equipamento || []).length,
        ip: formData.ip || '',
        mac: formData.mac || '',
        cor: formData.cor || generateColorFromName(formData.nome)
      };

      const updatedGrupos = [...grupos, newGroup];
      setGrupos(updatedGrupos);
      await gruposAPI.add({
        nome: formData.nome,
        descricao: formData.descricao,
        equipamento: formData.equipamento || [],
        totalComputadores: (formData.equipamento || []).length,
        ip: formData.ip || '',
        mac: formData.mac || '',
        cor: newGroup.cor
      });
      toast.success('Seção criada com sucesso!');
    }
    
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nome: '',
      descricao: '',
      equipamento: [],
      ip: '',
      mac: ''
    });
  };

  const handleEdit = (grupo) => {
    setIsEditing(true);
    setEditingId(grupo.id);
    setFormData({
      nome: grupo.nome,
      descricao: grupo.descricao,
      equipamento: grupo.equipamento || grupo.computadores || [],
      ip: grupo.ip || '',
      mac: grupo.mac || '',
      cor: grupo.cor || generateColorFromName(grupo.nome)
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nome: '',
      descricao: '',
      equipamento: [],
      ip: '',
      mac: '',
      cor: '#4ECDC4'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta seção?')) {
      const updatedGrupos = grupos.filter(g => g.id !== id);
      setGrupos(updatedGrupos);
      await gruposAPI.delete(id);
      toast.success('Seção excluída com sucesso!');
    }
  };

  // Funções para gerenciar tipos
  const handleTipoSubmit = (e) => {
    e.preventDefault();
    
    if (isEditingTipo) {
      // Atualizar tipo existente
      const updatedTipos = tipos.map(tipo => 
        tipo.id === editingTipoId 
          ? { ...tipo, ...tipoFormData }
          : tipo
      );
      setTipos(updatedTipos);
      localStorage.setItem('tipos', JSON.stringify(updatedTipos));
      toast.success('Tipo atualizado com sucesso!');
    } else {
      // Criar novo tipo
      const newTipo = {
        id: Date.now(),
        ...tipoFormData
      };
      const updatedTipos = [...tipos, newTipo];
      setTipos(updatedTipos);
      localStorage.setItem('tipos', JSON.stringify(updatedTipos));
      toast.success('Tipo criado com sucesso!');
    }
    
    setShowTipoFormModal(false);
    setShowTipoModal(true); // Voltar para a lista de tipos
    setIsEditingTipo(false);
    setEditingTipoId(null);
    setTipoFormData({ nome: '', descricao: '', cor: '#4ECDC4' });
  };

  const handleEditTipo = (tipo) => {
    setTipoFormData(tipo);
    setIsEditingTipo(true);
    setEditingTipoId(tipo.id);
    setShowTipoFormModal(true);
    setShowTipoModal(false); // Fechar modal de lista
  };

  const handleDeleteTipo = (tipoId) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo?')) {
      const updatedTipos = tipos.filter(tipo => tipo.id !== tipoId);
      setTipos(updatedTipos);
      localStorage.setItem('tipos', JSON.stringify(updatedTipos));
      toast.success('Tipo excluído com sucesso!');
    }
  };

  const handleNewTipo = () => {
    // Fechar modal de grupos se estiver aberto
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    
    // Fechar modal de formulário de tipos se estiver aberto
    setShowTipoFormModal(false);
    
    // Abrir apenas o modal de lista de tipos
    setShowTipoModal(true);
  };

  const handleCloseTipoModal = () => {
    setShowTipoModal(false);
    setIsEditingTipo(false);
    setEditingTipoId(null);
    setTipoFormData({ nome: '', descricao: '', cor: '#4ECDC4' });
  };

  const handleOpenTipoForm = () => {
    setTipoFormData({ nome: '', descricao: '', cor: '#4ECDC4' });
    setIsEditingTipo(false);
    setEditingTipoId(null);
    setShowTipoModal(false); // Fechar o modal de lista
    setShowTipoFormModal(true); // Abrir o modal de formulário
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Drag and Drop Functions
  const handleDragStart = (e, computerName, groupId) => {
    setDraggedComputer(computerName);
    setDraggedFromGroup(groupId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, groupId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroup(groupId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverGroup(null);
  };

  const handleDrop = (e, targetGroupId) => {
    e.preventDefault();
    
    if (!draggedComputer || !draggedFromGroup || targetGroupId === draggedFromGroup) {
      setDraggedComputer(null);
      setDraggedFromGroup(null);
      setDragOverGroup(null);
      return;
    }

    // Encontrar os grupos
    const sourceGroup = grupos.find(g => g.id === draggedFromGroup);
    const targetGroup = grupos.find(g => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup) {
      setDraggedComputer(null);
      setDraggedFromGroup(null);
      setDragOverGroup(null);
      return;
    }

    // Remover equipamento do grupo origem
    const updatedSourceGroup = {
      ...sourceGroup,
      equipamento: (sourceGroup.equipamento || sourceGroup.computadores || []).filter(comp => comp !== draggedComputer),
      totalComputadores: (sourceGroup.equipamento || sourceGroup.computadores || []).filter(comp => comp !== draggedComputer).length
    };

    // Adicionar equipamento ao grupo destino
    const updatedTargetGroup = {
      ...targetGroup,
      equipamento: [...(targetGroup.equipamento || targetGroup.computadores || []), draggedComputer],
      totalComputadores: (targetGroup.equipamento || targetGroup.computadores || []).length + 1
    };

    // Atualizar lista de grupos
    const updatedGrupos = grupos.map(grupo => {
      if (grupo.id === draggedFromGroup) return updatedSourceGroup;
      if (grupo.id === targetGroupId) return updatedTargetGroup;
      return grupo;
    });

    setGrupos(updatedGrupos);
    localStorage.setItem('grupos', JSON.stringify(updatedGrupos));

    // Atualizar computadores no localStorage
    updateComputerGroup(draggedComputer, targetGroup.nome);

    // Limpar estados de drag
    setDraggedComputer(null);
    setDraggedFromGroup(null);
    setDragOverGroup(null);

    toast.success(`Computador ${draggedComputer} movido para ${targetGroup.nome}!`);
  };

  const updateComputerGroup = (computerName, newGroupName) => {
    const computadores = JSON.parse(localStorage.getItem('computadores') || '[]');
    const updatedComputadores = computadores.map(comp => {
      if (comp.nome === computerName) {
        return { ...comp, secao: newGroupName };
      }
      return comp;
    });
    localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
  };

  if (!user) return null;

  return (
    <AdminDashboard currentPage="grupos">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              Gerenciar Seções e Tipos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie seções e tipos de equipamentos
            </p>
          </div>
          <div className="flex gap-3">
            <AdminButton onClick={() => setShowGrupoModal(true)}>
              ➕ Gerenciar Seções
            </AdminButton>
            <AdminButton variant="secondary" onClick={handleNewTipo}>
              🏷️ Gerenciar Tipos
            </AdminButton>
          </div>
        </div>

        {/* Tabela de Seções */}
        <AdminCard>
          <h2 className="text-xl font-bold text-cb-text-primary mb-4">Seções</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Seção</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Equipamentos</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {grupos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 sm:px-4 md:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma seção cadastrada
                    </td>
                  </tr>
                ) : (
                  grupos.map((grupo) => {
                    const equipamentos = grupo.equipamento || grupo.computadores || [];
                    return (
                      <tr key={grupo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 sm:px-3 py-0.5 rounded-full text-xs sm:text-sm font-medium"
                            style={{
                              background: `linear-gradient(90deg, ${(grupo.cor || '#4ECDC4')} 0%, ${darkenColor(grupo.cor || '#4ECDC4', 40)} 100%)`,
                              borderColor: grupo.cor || '#4ECDC4',
                              color: getReadableTextColor(grupo.cor || '#4ECDC4'),
                              boxShadow: `0 0 0 3px rgba(78,205,196,0.05), 0 8px 22px ${normalizeHex(grupo.cor || '#4ECDC4')}33`
                            }}
                          >
                            {grupo.nome}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {equipamentos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {/* Desktop: mostrar todos */}
                              <div className="hidden md:flex flex-wrap gap-1">
                                {equipamentos.map((comp, idx2) => (
                                  <span key={idx2} className="px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                    {comp}
                                  </span>
                                ))}
                              </div>
                              {/* Mobile: mostrar apenas 2 e concatenar o resto */}
                              <div className="flex md:hidden flex-wrap gap-1">
                                {equipamentos.slice(0, 2).map((comp, idx2) => (
                                  <span key={idx2} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                    {comp}
                                  </span>
                                ))}
                                {equipamentos.length > 2 && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                    +{equipamentos.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Nenhum</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <AdminButton variant="primary" onClick={() => handleEdit(grupo)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"> Editar</AdminButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        {/* Tabela de Tipos */}
        <AdminCard className="mt-6">
          <h2 className="text-xl font-bold text-cb-text-primary mb-4">Tipos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tipos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 sm:px-4 md:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhum tipo cadastrado
                    </td>
                  </tr>
                ) : (
                  tipos.map((tipo) => {
                    const tipoColor = tipo.cor || generateColorFromName(tipo.nome);
                    return (
                      <tr key={tipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 sm:px-3 py-0.5 rounded-full text-xs sm:text-sm font-medium"
                            style={{
                              background: `linear-gradient(90deg, ${tipoColor} 0%, ${darkenColor(tipoColor, 40)} 100%)`,
                              borderColor: tipoColor,
                              color: getReadableTextColor(tipoColor),
                              boxShadow: `0 0 0 3px rgba(78,205,196,0.05), 0 8px 22px ${normalizeHex(tipoColor)}33`
                            }}
                          >
                            {tipo.nome}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {tipo.descricao || 'Sem descrição'}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <AdminButton variant="primary" onClick={() => handleEditTipo(tipo)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">✏️ Editar</AdminButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminModal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={isEditing ? 'Editar Seção' : 'Criar Nova Seção'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminInput
              label="Nome da Seção *"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Ex: Setor Administrativo"
              required
            />
            <AdminTextarea
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva a finalidade desta seção"
              rows="4"
            />
            <AdminInput
              label="Cor"
              type="color"
              value={formData.cor}
              onChange={(e) => setFormData({...formData, cor: e.target.value})}
            />
            <div className="flex justify-end gap-3 pt-4">
              {isEditing && (
                <AdminButton 
                  variant="danger" 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir esta seção?')) {
                      handleDelete(editingId);
                      handleCloseModal();
                    }
                  }}
                >
                  🗑️ Excluir
                </AdminButton>
              )}
              <AdminButton variant="secondary" type="button" onClick={handleCloseModal}>
                Cancelar
              </AdminButton>
              <AdminButton variant="primary" type="submit">
                {isEditing ? 'Salvar' : 'Criar Seção'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>

        {/* Modal de Lista de Seções */}
        <AdminModal
          isOpen={showGrupoModal}
          onClose={() => setShowGrupoModal(false)}
          title="Seções Cadastradas"
          size="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {grupos.map((grupo) => {
                const secaoColor = getSecaoColor(grupo.nome);
                const darkenSecaoColor = darkenColor(secaoColor, 25);
                return (
                  <div
                    key={grupo.id}
                    className="relative overflow-hidden rounded-lg border border-cb-border shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${secaoColor} 0%, ${darkenSecaoColor} 100%)`,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-white truncate">{grupo.nome}</h4>
                          <p className="text-sm text-white/90 mt-1">{grupo.descricao || 'Sem descrição'}</p>
                        </div>
                        <button
                          onClick={() => { 
                            setShowGrupoModal(false); 
                            handleEdit(grupo); 
                          }}
                          className="flex-shrink-0 ml-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
                          title="Editar seção"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div 
                          className="w-10 h-10 rounded-lg bg-white/20 border-2 border-white/30"
                        />
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">
                            {grupo.totalComputadores || 0}
                          </div>
                          <div className="text-xs text-white/90">
                            computador{(grupo.totalComputadores || 0) !== 1 ? 'es' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <AdminButton
                onClick={() => { 
                  setShowGrupoModal(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ nome: '', descricao: '', equipamento: [], ip: '', mac: '', cor: '#4ECDC4' });
                  setShowModal(true);
                }}
              >
                ➕ Criar Nova Seção
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => setShowGrupoModal(false)}>
                Fechar
              </AdminButton>
            </div>
          </div>
        </AdminModal>

        {/* Modal para Gerenciar Tipos */}
        <AdminModal
          isOpen={showTipoFormModal}
          onClose={() => setShowTipoFormModal(false)}
          title={isEditingTipo ? 'Editar Tipo' : 'Criar Novo Tipo'}
        >
          <form onSubmit={handleTipoSubmit} className="space-y-4">
            <AdminInput
              label="Nome do Tipo"
              type="text"
              value={tipoFormData.nome}
              onChange={(e) => setTipoFormData({...tipoFormData, nome: e.target.value})}
              placeholder="Ex: Servidor, Estação de Trabalho"
              required
            />
            <AdminTextarea
              label="Descrição"
              value={tipoFormData.descricao}
              onChange={(e) => setTipoFormData({...tipoFormData, descricao: e.target.value})}
              placeholder="Descrição do tipo de equipamento"
              rows="3"
            />
            <AdminInput
              label="Cor"
              type="color"
              value={tipoFormData.cor}
              onChange={(e) => setTipoFormData({...tipoFormData, cor: e.target.value})}
            />
            <div className="flex justify-end gap-3 pt-4">
              <AdminButton variant="secondary" type="button" onClick={() => setShowTipoFormModal(false)}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">
                {isEditingTipo ? 'Atualizar Tipo' : 'Criar Tipo'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>

        {/* Modal de Lista de Tipos */}
        <AdminModal
          isOpen={showTipoModal}
          onClose={handleCloseTipoModal}
          title="Tipos Cadastrados"
          size="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {tipos.map((tipo) => {
                const tipoColor = tipo.cor || generateColorFromName(tipo.nome);
                const darkenTipoColor = darkenColor(tipoColor, 25);
                return (
                  <div
                    key={tipo.id}
                    className="relative overflow-hidden rounded-lg border border-cb-border shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${tipoColor} 0%, ${darkenTipoColor} 100%)`,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-white truncate">{tipo.nome}</h4>
                          <p className="text-sm text-white/90 mt-1">{tipo.descricao || 'Sem descrição'}</p>
                        </div>
                        <button
                          onClick={() => handleEditTipo(tipo)}
                          className="flex-shrink-0 ml-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
                          title="Editar tipo"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-start mt-4">
                        <div 
                          className="w-10 h-10 rounded-lg bg-white/20 border-2 border-white/30"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <AdminButton onClick={handleOpenTipoForm}>
                ➕ Criar Novo Tipo
              </AdminButton>
              <AdminButton variant="secondary" onClick={handleCloseTipoModal}>
                Fechar
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      </div>
    </AdminDashboard>
  );
}

export default GerenciarGrupos;

