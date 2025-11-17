import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gruposAPI, computadoresAPI } from '../../services/api';
import { importProvidedDhcpData } from '../../services/dhcpService';
import { authService } from '../../services/authService';
import { auditService } from '../../services/auditService';
import AuditHistory from '../../components/AuditHistory';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminModal, AdminInput, AdminSelect, AdminButton } from '../../components/admin/AdminComponents';

function Equipamentos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [computadores, setComputadores] = useState([]);
  const [filteredComputadores, setFilteredComputadores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const [showAuditHistory, setShowAuditHistory] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [formData, setFormData] = useState({
    nome: '',
    ip: '',
    macAddress: '',
    lacre: '',
    status: '',
    secao: '',
    tipo: ''
  });
  const [editFormData, setEditFormData] = useState({
    nome: '',
    ip: '',
    macAddress: '',
    lacre: '',
    status: '',
    secao: '',
    tipo: ''
  });
  const [nameFormData, setNameFormData] = useState({
    name: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const formatIpAddress = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = digits.match(/.{1,3}/g) || [];
    return parts.join('.').slice(0, 15);
  };

  const formatMacAddress = (value) => {
    if (!value) return '';
    const hex = value.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12);
    const parts = hex.match(/.{1,2}/g) || [];
    return parts.join(':').slice(0, 17);
  };


  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadComputadores();
    loadGrupos();
    
  }, [navigate]);

  // Detectar parâmetros de edição vindos do Dashboard
  useEffect(() => {
    const editId = searchParams.get('edit');
    const editField = searchParams.get('field');
    const editValue = searchParams.get('value');
    
    if (editId && computadores.length > 0) {
      // Encontrar o equipamento pelo ID
      const equipamento = computadores.find(comp => comp.id === parseInt(editId));
      if (equipamento) {
        // Abrir modal de edição
        handleOpenEditModal(equipamento);
        
        // Scroll para o equipamento na tabela
        setTimeout(() => {
          const element = document.querySelector(`[data-equipamento-id="${editId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        // Limpar os parâmetros da URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('edit');
        newSearchParams.delete('field');
        newSearchParams.delete('value');
        navigate(`/computadores?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [searchParams, computadores, navigate]);


  useEffect(() => {
    // Processar parâmetros de URL
    const editParam = searchParams.get('edit');
    const filterParam = searchParams.get('filter');
    const valueParam = searchParams.get('value');
    const deleteParam = searchParams.get('delete');

    if (editParam) {
      // Formato: computerId-field
      const [computerId] = editParam.split('-');
      const computer = computadores.find(c => c.id === parseInt(computerId));
      if (computer) {
        handleOpenEditModal(computer);
        // Limpar parâmetros da URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('edit');
        newSearchParams.delete('field');
        newSearchParams.delete('value');
        navigate(`/computadores?${newSearchParams.toString()}`, { replace: true });
      }
    }

    if (filterParam === 'secao' && valueParam) {
      // Filtrar por seção
      const filtered = computadores.filter(comp => 
        comp.secao === decodeURIComponent(valueParam) || 
        (!comp.secao && valueParam === 'SEM SEÇÃO')
      );
      const sorted = applySorting(filtered);
      setFilteredComputadores(sorted);
    } else if (filterParam === 'tipo' && valueParam) {
      // Filtrar por tipo
      const targetTipo = decodeURIComponent(valueParam).toLowerCase();
      const filtered = computadores.filter(comp => {
        const tipoAtual = (comp.tipo || 'Sem tipo definido').toLowerCase();
        return tipoAtual === targetTipo;
      });
      const sorted = applySorting(filtered);
      setFilteredComputadores(sorted);
    } else if (!filterParam) {
      // Se não houver filtro, mostrar todos com ordenação
      const sorted = applySorting(computadores);
      setFilteredComputadores(sorted);
    }

    if (deleteParam) {
      // Processar exclusão
      const computerId = parseInt(deleteParam);
      const computer = computadores.find(c => c.id === computerId);
      if (computer) {
        // Mostrar alerta de confirmação
        if (window.confirm(`Tem certeza que deseja excluir o equipamento "${computer.nome}"?`)) {
          handleDeleteComputer(computerId);
        }
        // Limpar parâmetro da URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('delete');
        navigate(`/computadores?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [searchParams, computadores, navigate, sortField, sortDirection]);

  const loadGrupos = async () => {
    try {
      const gruposData = await gruposAPI.getAll();
      setGrupos(gruposData);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  // Aplicar ordenação se existir
  const applySorting = (computadoresList) => {
    if (!sortField) return computadoresList;
    
    return [...computadoresList].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortField === 'ip') {
        aValue = aValue.split('.').map(num => parseInt(num) || 0);
        bValue = bValue.split('.').map(num => parseInt(num) || 0);
        
        for (let i = 0; i < 4; i++) {
          if (aValue[i] !== bValue[i]) {
            return sortDirection === 'asc' ? aValue[i] - bValue[i] : bValue[i] - aValue[i];
          }
        }
        return 0;
      }
      
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterByResponsavel = useCallback(async (responsavelNome) => {
    try {
      // Buscar histórico de auditoria
      const historico = await auditService.getRecentActivity(500);
      
      // Criar um Set com os IDs dos equipamentos alterados por este responsável
      const equipamentosIds = new Set();
      
      historico.forEach((item) => {
        const itemResponsavel = (item.userName || item.responsavel || '').trim();
        if (itemResponsavel === responsavelNome && item.entityType === 'computador' && item.entityId) {
          equipamentosIds.add(item.entityId.toString());
          // Também adicionar o ID numérico caso seja diferente
          if (!isNaN(item.entityId)) {
            equipamentosIds.add(parseInt(item.entityId).toString());
          }
        }
      });

      // Filtrar computadores que estão na lista de IDs
      const filtered = computadores.filter(comp => {
        const compId = comp.id?.toString() || comp.id;
        return equipamentosIds.has(compId.toString()) || 
               equipamentosIds.has(comp.id?.toString());
      });

      const sorted = applySorting(filtered);
      setFilteredComputadores(sorted);
    } catch (error) {
      console.error('Erro ao filtrar por responsável:', error);
      // Em caso de erro, mostrar todos os equipamentos
      const sorted = applySorting(computadores);
      setFilteredComputadores(sorted);
    }
  }, [computadores, sortField, sortDirection]);

  useEffect(() => {
    // Processar filtro de responsável quando os parâmetros mudarem
    const filterParam = searchParams.get('filter');
    const valueParam = searchParams.get('value');
    
    if (filterParam === 'responsavel' && valueParam && computadores.length > 0) {
      const responsavelNome = decodeURIComponent(valueParam);
      filterByResponsavel(responsavelNome);
    }
  }, [searchParams, computadores, filterByResponsavel]);

  const atualizarContagemGrupos = async (computadoresAtualizados) => {
    // Recalcular membros e persistir tanto via API (Firebase/local) quanto localStorage
    try {
      // Buscar grupos atuais pela API para obter IDs corretos (Firebase ou localStorage)
      const gruposExistentes = await gruposAPI.getAll();

      const gruposAtualizados = await Promise.all(
        (gruposExistentes || []).map(async (grupo) => {
          const equipamentosDoGrupo = computadoresAtualizados
            .filter((comp) => comp.secao === grupo.nome)
            .map((comp) => comp.nome);

          const ips = [
            ...new Set(
              computadoresAtualizados
                .filter((comp) => comp.secao === grupo.nome)
                .map((comp) => comp.ip)
                .filter((ip) => ip)
            ),
          ];
          const macs = [
            ...new Set(
              computadoresAtualizados
                .filter((comp) => comp.secao === grupo.nome)
                .map((comp) => comp.macAddress)
                .filter((mac) => mac)
            ),
          ];

          const payload = {
            equipamento: equipamentosDoGrupo,
            totalComputadores: equipamentosDoGrupo.length,
            ip: ips.length > 0 ? ips.join(', ') : '',
            mac: macs.length > 0 ? macs.join(', ') : '',
          };

          // Persistir via API (lida com Firebase ou fallback localStorage)
          try {
            await gruposAPI.update(grupo.id.toString(), payload);
          } catch (e) {
            console.error('Falha ao atualizar grupo via API', grupo.id, e);
          }

          return { ...grupo, ...payload };
        })
      );

      // Manter localStorage atualizado para telas que usam fallback
      localStorage.setItem('grupos', JSON.stringify(gruposAtualizados));
    } catch (err) {
      console.error('Erro ao atualizar contagem de grupos:', err);
    }
  };



  const loadComputadores = async () => {
    try {
      // Primeiro tentar carregar do Firebase
      const data = await computadoresAPI.getAll();
      
      if (data && data.length > 0) {
        setComputadores(data);
        const sorted = applySorting(data);
        setFilteredComputadores(sorted);
        
        // Sincronizar com localStorage como backup
        localStorage.setItem('computadores', JSON.stringify(data));
        
        return;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Firebase:', error);
    }
    
    // Fallback: carregar do localStorage
    const storedComputadores = localStorage.getItem('computadores');
    
    if (storedComputadores) {
      const data = JSON.parse(storedComputadores);
      setComputadores(data);
      const sorted = applySorting(data);
      setFilteredComputadores(sorted);
    } else {
      // Se não há dados no localStorage, importar automaticamente do arquivo DHCP
      try {
        const importedComputadores = importProvidedDhcpData();
        
        if (importedComputadores.length > 0) {
          setComputadores(importedComputadores);
          const sorted = applySorting(importedComputadores);
          setFilteredComputadores(sorted);
          toast.success(`✅ ${importedComputadores.length} computadores importados automaticamente do arquivo DHCP da 1ª CIA INF!`);
        } else {
          // Dados de exemplo se não conseguir importar
          const mockData = [
            {
              id: 1,
              nome: 'INFOR-PC3',
              ip: '10.170.79.2',
              macAddress: '00:1a:2b:4d:5e:123',
              lacre: '12345',
              status: 'João Silva',
              secao: 'TI'
            },
        {
          id: 2,
          nome: 'ADMIN-PC1',
          ip: '10.170.79.5',
          macAddress: '00:1a:2b:4d:5e:124',
          lacre: '67890',
          status: 'Maria Santos',
          secao: 'Administrativo'
        },
        {
          id: 3,
          nome: 'DEV-PC2',
          ip: '10.170.79.8',
          macAddress: '00:1a:2b:4d:5e:125',
          lacre: '11223',
          status: 'Pedro Oliveira',
          secao: 'Financeiro'
        }
      ];

          setComputadores(mockData);
          const sorted = applySorting(mockData);
          setFilteredComputadores(sorted);
          localStorage.setItem('computadores', JSON.stringify(mockData));
        }
      } catch (error) {
        console.error('Erro ao importar dados DHCP:', error);
        toast.error('Erro ao importar dados DHCP automaticamente. Usando dados de exemplo.');
        
        // Dados de exemplo em caso de erro
        const mockData = [
          {
            id: 1,
            nome: 'INFOR-PC3',
            ip: '10.170.79.2',
            macAddress: '00:1a:2b:4d:5e:123',
            lacre: '12345',
            status: 'João Silva',
            secao: 'TI'
          },
          {
            id: 2,
            nome: 'ADMIN-PC1',
            ip: '10.170.79.5',
            macAddress: '00:1a:2b:4d:5e:124',
            lacre: '67890',
            status: 'Maria Santos',
            secao: 'Administrativo'
          },
          {
            id: 3,
            nome: 'DEV-PC2',
            ip: '10.170.79.8',
            macAddress: '00:1a:2b:4d:5e:125',
            lacre: '11223',
            status: 'Pedro Oliveira',
            secao: 'Financeiro'
          }
        ];

        setComputadores(mockData);
        setFilteredComputadores(mockData);
        localStorage.setItem('computadores', JSON.stringify(mockData));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se IP já existe
    const ipDuplicado = computadores.find(c => c.ip === formData.ip);
    if (ipDuplicado) {
      toast.warning(`⚠️ Alerta: O IP ${formData.ip} já está sendo usado pelo computador ${ipDuplicado.nome}`);
    }
    
    // Verificar se MAC já existe
    const macDuplicado = computadores.find(c => c.macAddress === formData.macAddress);
    if (macDuplicado) {
      toast.warning(`⚠️ Alerta: O MAC Address ${formData.macAddress} já está sendo usado pelo computador ${macDuplicado.nome}`);
    }
    
    // Verificar se Lacre já existe
    const lacreDuplicado = computadores.find(c => c.lacre === formData.lacre);
    if (lacreDuplicado) {
      toast.warning(`⚠️ Alerta: O Lacre ${formData.lacre} já está sendo usado pelo computador ${lacreDuplicado.nome}`);
    }
    
    try {
      const computerData = {
        ...formData
      };

      // Usar a API com auditoria
      const newId = await computadoresAPI.add(computerData);
      
      // Atualizar estado local
      const newComputer = {
        id: newId,
        ...computerData
      };
      
      const updatedComputadores = [...computadores, newComputer];
      setComputadores(updatedComputadores);
      
      // Aplicar ordenação se existir
      const sorted = applySorting(updatedComputadores);
      setFilteredComputadores(sorted);
      
      // Atualizar contagem dos grupos
      atualizarContagemGrupos(updatedComputadores);
      
      toast.success('Equipamento adicionado com sucesso!');
      setShowModal(false);
    setFormData({
      nome: '',
      ip: '',
      macAddress: '',
      lacre: '',
      status: '',
      secao: '',
      tipo: ''
    });
    } catch (error) {
      console.error('Erro ao adicionar equipamento:', error);
      toast.error('Erro ao adicionar equipamento. Tente novamente.');
    }
  };

  const handleDeleteComputer = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        // Usar a API com auditoria
        await computadoresAPI.delete(id.toString());
        
        // Atualizar estado local
        const updatedComputadores = computadores.filter(c => c.id !== id);
        setComputadores(updatedComputadores);
        
        // Aplicar ordenação se existir
        const sorted = applySorting(updatedComputadores);
        setFilteredComputadores(sorted);
        
        // Atualizar contagem dos grupos
        atualizarContagemGrupos(updatedComputadores);
        
        toast.success('Equipamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        toast.error('Erro ao excluir equipamento. Tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenEditModal = (computer) => {
    setEditingComputer(computer);
    setEditFormData({
      nome: computer.nome || '',
      ip: formatIpAddress(computer.ip || ''),
      macAddress: formatMacAddress(computer.macAddress || ''),
      lacre: computer.lacre || '',
      status: computer.status || '',
      secao: computer.secao || '',
      tipo: computer.tipo || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingComputer(null);
    setEditFormData({
      nome: '',
      ip: '',
      macAddress: '',
      lacre: '',
      status: '',
      secao: '',
      tipo: ''
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!editingComputer) return;

    try {
      // Verificar se IP já existe (exceto o próprio equipamento)
      const ipDuplicado = computadores.find(c => c.ip === editFormData.ip && c.id !== editingComputer.id);
      if (ipDuplicado) {
        toast.warning(`⚠️ Alerta: O IP ${editFormData.ip} já está sendo usado pelo computador ${ipDuplicado.nome}`);
        return;
      }
      
      // Verificar se MAC já existe (exceto o próprio equipamento)
      const macDuplicado = computadores.find(c => c.macAddress === editFormData.macAddress && c.id !== editingComputer.id);
      if (macDuplicado) {
        toast.warning(`⚠️ Alerta: O MAC Address ${editFormData.macAddress} já está sendo usado pelo computador ${macDuplicado.nome}`);
        return;
      }
      
      // Verificar se Lacre já existe (exceto o próprio equipamento)
      const lacreDuplicado = computadores.find(c => c.lacre === editFormData.lacre && c.id !== editingComputer.id);
      if (lacreDuplicado) {
        toast.warning(`⚠️ Alerta: O Lacre ${editFormData.lacre} já está sendo usado pelo computador ${lacreDuplicado.nome}`);
        return;
      }

      // Usar a API com auditoria
      await computadoresAPI.update(editingComputer.id.toString(), editFormData);
      
      // Atualizar estado local
      const updatedComputadores = computadores.map(comp => {
        if (comp.id === editingComputer.id) {
          return { ...comp, ...editFormData };
        }
        return comp;
      });
      
      setComputadores(updatedComputadores);
      
      // Aplicar ordenação se existir
      const sorted = applySorting(updatedComputadores);
      setFilteredComputadores(sorted);
      
      // Atualizar contagem dos grupos se a seção mudou
      if (editFormData.secao !== editingComputer.secao) {
        atualizarContagemGrupos(updatedComputadores);
      }
      
      handleCloseEditModal();
      toast.success('Equipamento atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento. Tente novamente.');
    }
  };

  // Funções de ordenação e filtro
  const handleSort = (field) => {
    let newDirection = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newDirection = 'desc';
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = [...filteredComputadores].sort((a, b) => {
      let aValue = a[field] || '';
      let bValue = b[field] || '';
      
      // Para campos numéricos (IP)
      if (field === 'ip') {
        aValue = aValue.split('.').map(num => parseInt(num) || 0);
        bValue = bValue.split('.').map(num => parseInt(num) || 0);
        
        for (let i = 0; i < 4; i++) {
          if (aValue[i] !== bValue[i]) {
            return newDirection === 'asc' ? aValue[i] - bValue[i] : bValue[i] - aValue[i];
          }
        }
        return 0;
      }
      
      // Para campos de texto
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      
      if (newDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    setFilteredComputadores(sorted);
  };

  // Funções para modais de configuração
  const handleOpenNameModal = () => {
    setShowNameModal(true);
    setNameFormData({ name: user?.nomeGuerra || user?.name || '' });
  };

  const handleCloseNameModal = () => {
    setShowNameModal(false);
    setNameFormData({ name: '' });
  };

  const handleSubmitName = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, nomeGuerra: nameFormData.name, name: nameFormData.name };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    handleCloseNameModal();
    toast.success('Nome atualizado com sucesso!');
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    try {
      await authService.changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      handleClosePasswordModal();
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Verifique a senha atual.');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

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

  // Retorna a cor configurada para a seção usando a paleta CLIP
  const getSecaoColor = (secaoNome) => {
    if (!secaoNome) return CLIP_COLOR_PALETTE[0];
    
    // Primeiro, tentar buscar a cor do grupo (se foi configurada manualmente)
    const grupo = grupos.find((g) => (g.nome || '').trim() === (secaoNome || '').trim());
    if (grupo?.cor) {
      // Verificar se a cor do grupo está na paleta CLIP ou é uma cor válida
      return grupo.cor;
    }
    
    // Normalizar nome da seção
    const normalizedName = (secaoNome || '').trim().toUpperCase();
    
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

  // Utilitários de cor para gerar contraste e sombreamento agradável
  const normalizeHex = (hex) => {
    if (!hex) return '#4ECDC4';
    const h = hex.trim();
    if (h.startsWith('#') && h.length === 4) {
      // formato #abc -> #aabbcc
      return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return h;
  };

  const darkenColor = (hex, amount = 15) => {
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



  if (!user) return null;

  return (
    <AdminDashboard currentPage="equipamentos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-cb-text-primary sm:truncate sm:text-3xl sm:tracking-tight">
              Gerenciar Equipamentos
            </h1>
            <p className="mt-1 text-sm text-cb-text-secondary">
              Gerencie todos os equipamentos da rede
            </p>
          </div>
          <AdminButton onClick={() => setShowModal(true)}>
            ➕ Adicionar Equipamento
          </AdminButton>
        </div>


        <AdminCard>
          <div className="overflow-hidden w-full">
            <table className="w-full divide-y divide-cb-border table-fixed">
              <thead className="bg-cb-card">
                <tr>
                  <th className="hidden md:table-cell w-[12%] px-4 py-3 text-center text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Tipo</th>
                  <th className="hidden md:table-cell w-[15%] px-4 py-3 text-center text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Seção</th>
                  <th className="w-[35%] md:w-[18%] px-2 sm:px-4 py-3 text-center text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Nome</th>
                  <th className="w-[30%] md:w-[15%] px-2 sm:px-4 py-3 text-center text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">IP</th>
                  <th className="hidden md:table-cell w-[12%] px-4 py-3 text-center text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">MAC</th>
                  <th className="hidden md:table-cell w-[10%] px-4 py-3 text-center text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Lacre</th>
                  <th className="w-[35%] md:w-[18%] px-2 sm:px-4 py-3 text-center text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-cb-card divide-y divide-cb-border">
                {filteredComputadores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-2 sm:px-6 py-4 text-center text-sm text-cb-text-secondary">
                      Nenhum equipamento encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredComputadores.map((comp) => (
                  <tr key={comp.id} data-equipamento-id={comp.id} className="hover:bg-cb-hover transition-colors duration-200">
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-cb-text-primary text-center break-words">
                      {comp.tipo || 'Não definido'}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-center">
                      <button 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${!comp.secao ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}`}
                        style={{ 
                          borderLeft: comp.secao ? `8px solid ${getSecaoColor(comp.secao)}` : undefined,
                          paddingLeft: comp.secao ? '10px' : undefined,
                          background: comp.secao ? `linear-gradient(135deg, ${getSecaoColor(comp.secao)} 0%, ${darkenColor(getSecaoColor(comp.secao), 25)} 100%)` : undefined,
                          borderColor: comp.secao ? getSecaoColor(comp.secao) : undefined,
                          color: comp.secao ? getReadableTextColor(getSecaoColor(comp.secao)) : undefined
                        }}
                      >
                        {comp.secao || 'SEM SEÇÃO'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-cb-text-primary text-center break-words">
                      {comp.nome}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-cb-text-primary text-center break-words">
                      {comp.ip}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-cb-text-primary text-center break-words">
                      {comp.macAddress}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-cb-text-primary text-center break-words">
                      {comp.lacre}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-center">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center items-center">
                        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2">

                          <AdminButton 
                            variant="secondary" 
                            onClick={() => navigate(`/historico?equipamentoId=${comp.id}&equipmentId=${comp.id}`)}
                            className="text-[10px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto"
                          >
                            Histórico
                          </AdminButton>
                        </div>
                        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2">

                          <AdminButton 
                            variant="primary" 
                            onClick={() => handleOpenEditModal(comp)}
                            className="text-[10px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto"
                          >
                            Editar
                          </AdminButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Adicionar Novo Equipamento"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminInput
              label="Nome do Equipamento *"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Digite o nome do equipamento"
              required
            />
            <AdminSelect
              label="Tipo de Equipamento *"
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="Servidor">Servidor</option>
              <option value="Computador">Computador</option>
              <option value="Notebook">Notebook</option>
              <option value="Impressora">Impressora</option>
              <option value="Câmera">Câmera</option>
              <option value="Switch">Switch</option>
              <option value="DVR">DVR</option>
              <option value="NVR">NVR</option>
            </AdminSelect>
            <AdminInput
              label="Endereço IP *"
              type="text"
                  value={formData.ip}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ip: formatIpAddress(e.target.value),
                    })
                  }
              placeholder="192.168.1.1"
              required
            />
            <AdminInput
              label="MAC Address *"
              type="text"
                  value={formData.macAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      macAddress: formatMacAddress(e.target.value),
                    })
                  }
              placeholder="00:1A:2B:3C:4D:5E"
              required
            />
            <AdminInput
              label="Lacre *"
              type="text"
              value={formData.lacre}
              onChange={(e) => setFormData({...formData, lacre: e.target.value})}
              placeholder="Digite a sequência do lacre"
              required
            />
            <AdminSelect
              label="Seções *"
              value={formData.secao}
              onChange={(e) => setFormData({...formData, secao: e.target.value})}
              required
            >
              <option value="">Selecione uma seção</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.nome}>
                  {grupo.nome}
                </option>
              ))}
            </AdminSelect>
            <div className="flex justify-end gap-3 pt-4">
              <AdminButton variant="secondary" type="button" onClick={() => setShowModal(false)}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">
                Adicionar
              </AdminButton>
            </div>
          </form>
        </AdminModal>

        {/* Modal de Edição de Equipamento */}
        <AdminModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="✏️ Editar Equipamento"
          size="lg"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <AdminInput
              label="Nome do Equipamento *"
              type="text"
              value={editFormData.nome}
              onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
              placeholder="Digite o nome do equipamento"
              required
            />
            <AdminSelect
              label="Tipo de Equipamento *"
              value={editFormData.tipo}
              onChange={(e) => setEditFormData({...editFormData, tipo: e.target.value})}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="Servidor">Servidor</option>
              <option value="Computador">Computador</option>
              <option value="Notebook">Notebook</option>
              <option value="Impressora">Impressora</option>
              <option value="Câmera">Câmera</option>
              <option value="Switch">Switch</option>
              <option value="DVR">DVR</option>
              <option value="NVR">NVR</option>
            </AdminSelect>
            <AdminInput
              label="Endereço IP *"
              type="text"
                  value={editFormData.ip}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      ip: formatIpAddress(e.target.value),
                    })
                  }
              placeholder="192.168.1.1"
              required
            />
            <AdminInput
              label="MAC Address *"
              type="text"
                  value={editFormData.macAddress}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      macAddress: formatMacAddress(e.target.value),
                    })
                  }
              placeholder="00:1A:2B:3C:4D:5E"
              required
            />
            <AdminInput
              label="Lacre *"
              type="text"
              value={editFormData.lacre}
              onChange={(e) => setEditFormData({...editFormData, lacre: e.target.value})}
              placeholder="Digite a sequência do lacre"
              required
            />
            <AdminInput
              label="Status"
              type="text"
              value={editFormData.status}
              onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
              placeholder="Digite o status do equipamento"
            />
            <AdminSelect
              label="Seções *"
              value={editFormData.secao}
              onChange={(e) => setEditFormData({...editFormData, secao: e.target.value})}
              required
            >
              <option value="">Selecione uma seção</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.nome}>
                  {grupo.nome}
                </option>
              ))}
            </AdminSelect>
            <div className="flex justify-between items-center pt-4 border-t border-cb-border">
              <div>
                <AdminButton 
                  variant="danger" 
                  type="button" 
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir o equipamento "${editingComputer?.nome}"?`)) {
                      handleDeleteComputer(editingComputer.id);
                      handleCloseEditModal();
                    }
                  }}
                >
                  🗑️ Excluir Equipamento
                </AdminButton>
              </div>
              <div className="flex gap-3">
                <AdminButton variant="secondary" type="button" onClick={handleCloseEditModal}>
                  Cancelar
                </AdminButton>
                <AdminButton variant="primary" type="submit">
                  Salvar Alterações
                </AdminButton>
              </div>
            </div>
          </form>
        </AdminModal>

        {/* Modal de Histórico de Auditoria */}
        {showAuditHistory && (
          <AdminModal
            isOpen={!!showAuditHistory}
            onClose={() => setShowAuditHistory(null)}
            title="📝 Histórico de Mudanças"
            size="xl"
          >
            <AuditHistory 
              equipmentId={showAuditHistory.toString()}
              equipmentName={computadores.find(c => c.id === showAuditHistory)?.nome || 'Equipamento'}
            />
          </AdminModal>
        )}


        {/* Modal de Trocar Nome */}
        <AdminModal
          isOpen={showNameModal}
          onClose={handleCloseNameModal}
          title="Trocar Nome"
        >
          <form onSubmit={handleSubmitName} className="space-y-4">
            <AdminInput
              label="Novo Nome"
              type="text"
              value={nameFormData.name}
              onChange={(e) => setNameFormData({...nameFormData, name: e.target.value})}
              placeholder="Digite seu novo nome"
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <AdminButton variant="secondary" type="button" onClick={handleCloseNameModal}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">
                Salvar
              </AdminButton>
            </div>
          </form>
        </AdminModal>

        {/* Modal de Trocar Senha */}
        <AdminModal
          isOpen={showPasswordModal}
          onClose={handleClosePasswordModal}
          title="Trocar Senha"
        >
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <AdminInput
              label="Senha Atual"
              type="password"
              value={passwordFormData.currentPassword}
              onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})}
              placeholder="Digite sua senha atual"
              required
            />
            <AdminInput
              label="Nova Senha"
              type="password"
              value={passwordFormData.newPassword}
              onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
              placeholder="Digite sua nova senha"
              required
            />
            <AdminInput
              label="Confirmar Nova Senha"
              type="password"
              value={passwordFormData.confirmPassword}
              onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
              placeholder="Confirme sua nova senha"
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <AdminButton variant="secondary" type="button" onClick={handleClosePasswordModal}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">
                Salvar
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      </div>
    </AdminDashboard>
  );
}

export default Equipamentos;