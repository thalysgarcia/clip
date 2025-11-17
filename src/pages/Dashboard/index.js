import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { gruposAPI, computadoresAPI } from '../../services/api';
import { authService } from '../../services/authService';
import AuditHistory from '../../components/AuditHistory';
import logger from '../../utils/logger';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminModal, AdminInput, AdminButton } from '../../components/admin/AdminComponents';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

function Dashboard() {
  const navigate = useNavigate();
  
  // 🚀 PERFORMANCE: Usar hook customizado de autenticação
  const { user, loading: authLoading, logout: handleLogout, refreshUser } = useAuth();
  
  const [computadores, setComputadores] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState({
    totalComputadores: 0,
    totalIps: 0,
    totalMacAddresses: 0,
    totalUsers: 0
  });

  // 🚀 PERFORMANCE: Memoizar distribuição por tipo
  const tiposDistribuicao = useMemo(() => {
    return computadores.reduce((acc, comp) => {
      const tipo = comp.tipo || 'Não definido';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
  }, [computadores]);

  // 🚀 PERFORMANCE: Memoizar distribuição por seção
  const secoesDistribuicao = useMemo(() => {
    return computadores.reduce((acc, comp) => {
      const secao = comp.secao || 'SEM SEÇÃO';
      acc[secao] = (acc[secao] || 0) + 1;
      return acc;
    }, {});
  }, [computadores]);

  // 🚀 PERFORMANCE: Memoizar top 5 seções
  const secoesTop = useMemo(() => {
    return Object.entries(secoesDistribuicao)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [secoesDistribuicao]);

  const [grupos, setGrupos] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [showAuditHistory, setShowAuditHistory] = useState(null);

  // 🚀 PERFORMANCE: useCallback para loadData
  const loadData = useCallback(async () => {
    try {
      logger.time('Dashboard loadData');
      const data = await computadoresAPI.getAll();
      setComputadores(data);
      
      setStats({
        totalComputadores: data.length,
        totalIps: new Set(data.map(c => c.ip).filter(ip => ip)).size,
        totalMacAddresses: new Set(data.map(c => c.macAddress).filter(mac => mac)).size
      });
      
      logger.timeEnd('Dashboard loadData');
      logger.success('Dashboard: Dados carregados', { 
        total: data.length
      });
    } catch (error) {
      logger.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  }, []);

  // 🚀 PERFORMANCE: useCallback para loadGrupos
  const loadGrupos = useCallback(async () => {
    try {
      const gruposData = await gruposAPI.getAll();
      setGrupos(gruposData);
    } catch (error) {
      logger.error('Erro ao carregar grupos:', error);
    }
  }, []);

  // Carregar total de usuários
  const loadUsers = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    } catch (error) {
      logger.error('Erro ao carregar usuários:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (!authLoading && user) {
      loadData();
      loadGrupos();
      loadUsers();
    }
  }, [authLoading, user, loadData, loadGrupos, loadUsers]);


  // Salvar automaticamente antes de navegar para outras páginas
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Salvar dados antes de sair da página
      localStorage.setItem('computadores', JSON.stringify(computadores));
    };

    const handleLinkClick = (event) => {
      // Detectar cliques em links de navegação
      const link = event.target.closest('a');
      if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
        // Salvar antes de navegar
        localStorage.setItem('computadores', JSON.stringify(computadores));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [computadores]);

  // 🚀 PERFORMANCE: loadGrupos agora definido no início com useCallback (linha 100)

  // 🚀 PERFORMANCE: loadData agora definido no início com useCallback (linha 72)

  const handleEdit = (id) => {
    navigate(`/lacre/${id}`);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const atualizarContagemGrupos = (computadoresAtualizados) => {
    // Atualizar a contagem de equipamentos nos grupos
    const gruposData = localStorage.getItem('grupos');
    if (gruposData) {
      const grupos = JSON.parse(gruposData);
      
      const gruposAtualizados = grupos.map(grupo => {
        // Contar quantos equipamentos pertencem a este grupo
        const equipamentosDoGrupo = computadoresAtualizados
          .filter(comp => comp.secao === grupo.nome)
          .map(comp => comp.nome);
        
        // Extrair IPs e MACs únicos do grupo
        const ips = [...new Set(computadoresAtualizados
          .filter(comp => comp.secao === grupo.nome)
          .map(comp => comp.ip)
          .filter(ip => ip))];
        const macs = [...new Set(computadoresAtualizados
          .filter(comp => comp.secao === grupo.nome)
          .map(comp => comp.macAddress)
          .filter(mac => mac))];
        
        return {
          ...grupo,
          equipamento: equipamentosDoGrupo,
          totalComputadores: equipamentosDoGrupo.length,
          ip: ips.length > 0 ? ips.join(', ') : '',
          mac: macs.length > 0 ? macs.join(', ') : ''
        };
      });
      
      localStorage.setItem('grupos', JSON.stringify(gruposAtualizados));
    }
  };

  const handleDeleteComputer = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await computadoresAPI.delete(id.toString());
        const updatedComputadores = computadores.filter(c => c.id !== id);
        setComputadores(updatedComputadores);
        localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
        
        // Atualizar contagem dos grupos
        atualizarContagemGrupos(updatedComputadores);
        
        // Recarregar dados para atualizar estatísticas
        loadData();
        
        toast.success('Equipamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        toast.error('Erro ao excluir equipamento. Tente novamente.');
      }
    }
  };

  // 🚀 PERFORMANCE: handleLogout agora vem do useAuth hook

  const handleFieldClick = (computerId, field, currentValue) => {
    setEditingField(`${computerId}-${field}`);
    setEditingValue(currentValue || '');
  };

  const handleFieldEdit = async (computerId, field, newValue) => {
    try {
      // Usar a API com auditoria
      await computadoresAPI.update(computerId.toString(), {
        [field]: newValue
      });
      
      // Atualizar estado local
      const updatedComputadores = computadores.map(comp => {
        if (comp.id === computerId) {
          return { ...comp, [field]: newValue };
        }
        return comp;
      });
      
      setComputadores(updatedComputadores);
      localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
      
      // Atualizar contagem dos grupos se for seção
      if (field === 'secao') {
        atualizarContagemGrupos(updatedComputadores);
      }
      
      // Recarregar dados para atualizar estatísticas
      loadData();
      
      setEditingField(null);
      setEditingValue('');
      toast.success('Campo atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento. Tente novamente.');
    }
  };

  const handleSaveEdit = (computerId, field, newValue) => {
    handleFieldEdit(computerId, field, newValue);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyPress = (e, computerId, field) => {
    if (e.key === 'Enter') {
      handleFieldEdit(computerId, field, editingValue);
    } else if (e.key === 'Escape') {
      handleFieldCancel();
    }
  };

  const handleSectionClick = (secao) => {
    // Navegar para a página de equipamentos filtrando por seção
    navigate(`/computadores?filter=secao&value=${encodeURIComponent(secao)}`);
  };

  const handleOpenModal = (type) => {
    setShowModal(type);
    if (type === 'name') {
      setFormData({ ...formData, name: user.nomeGuerra || user.name || '' });
    } else if (type === 'email') {
      setFormData({ ...formData, email: user.email || '' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setFormData({
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    try {
      await authService.updateNomeGuerraByEmail(user.email, formData.name);
      await refreshUser();
      handleCloseModal();
      toast.success('Nome atualizado com sucesso!');
    } catch (error) {
      logger.error('Erro ao atualizar nome:', error);
      toast.error('Erro ao atualizar nome');
    }
  };

  const handleSubmitEmail = (e) => {
    e.preventDefault();
    // Email não pode ser alterado diretamente (requer reautenticação no Firebase)
    handleCloseModal();
    toast.warning('Alterar email requer reautenticação. Entre em contato com o suporte.');
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
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

  // Função helper para sempre retornar o nome de guerra quando disponível
  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    
    // Sempre priorizar nomeGuerra se existir e não for o email
    if (user.nomeGuerra && 
        user.nomeGuerra.trim() !== '' && 
        user.nomeGuerra !== user.email && 
        user.nomeGuerra !== 'Usuário Anônimo') {
      return user.nomeGuerra;
    }
    
    // Se name existe e não é o email completo
    if (user.name && 
        user.name !== user.email && 
        user.name !== 'Usuário Anônimo' &&
        !user.name.includes('@')) {
      
      // Se name parece ser um nome completo (tem 2 ou mais palavras), usar apenas o primeiro nome
      const nameParts = user.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // Se não tem nome de guerra definido, usar apenas o primeiro nome como fallback
        return nameParts[0];
      }
      
      // Se name tem apenas uma palavra, usar ele
      return user.name;
    }
    
    // Fallback para email ou padrão
    return user.email || 'Usuário';
  };

  // Função para atualizar o nome de guerra do usuário
  useEffect(() => {
    const updateNomeGuerra = async () => {
      if (!user) return;
      
      try {
        // Atualizar dados do usuário do Firestore
        await refreshUser();
      } catch (error) {
        logger.error('Erro ao atualizar nome de guerra:', error);
      }
    };
    
    // Atualizar imediatamente quando o componente montar
    updateNomeGuerra();
    
    // Atualizar periodicamente (a cada 5 segundos) para garantir que está atualizado
    const interval = setInterval(updateNomeGuerra, 5000);
    
    return () => clearInterval(interval);
  }, [user?.uid]); // Reexecutar quando o UID mudar

  if (!user) return null;

  return (
    <AdminDashboard currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-cb-text-primary sm:truncate sm:text-3xl sm:tracking-tight">
            {getGreeting()}, {getUserDisplayName()}
          </h1>
          <p className="mt-1 text-sm text-cb-text-secondary">
            Visão geral do sistema
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">💻</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cb-text-secondary truncate">
                    Total de Equipamentos
                  </dt>
                  <dd className="text-lg font-medium text-cb-text-primary">
                    {stats.totalComputadores}
                  </dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🌐</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cb-text-secondary truncate">
                    IPs Únicos
                  </dt>
                  <dd className="text-lg font-medium text-cb-text-primary">
                    {stats.totalIps}
                  </dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🔗</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cb-text-secondary truncate">
                    MAC Addresses
                  </dt>
                  <dd className="text-lg font-medium text-cb-text-primary">
                    {stats.totalMacAddresses}
                  </dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cb-text-secondary truncate">
                    Usuários Registrados
                  </dt>
                  <dd className="text-lg font-medium text-cb-text-primary">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Seção de Análises */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Distribuição por Tipo */}
          <AdminCard title="Distribuição por Tipo">
            <div className="space-y-3">
              {Object.entries(tiposDistribuicao).map(([tipo, count]) => (
                <div key={tipo} className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cb-text-primary truncate">
                      {tipo}
                    </div>
                    <div className="mt-1 flex items-center">
                      <div className="flex-1 bg-cb-hover rounded-full h-2 mr-2">
                        <div
                          className="bg-cb-primary h-2 rounded-full"
                          style={{ width: `${(count / stats.totalComputadores) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm text-cb-text-secondary">
                        {count}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Top Seções */}
          <AdminCard title="Top Seções">
            <div className="space-y-3">
              {secoesTop.map((secao, index) => (
                <div key={secao.nome} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-cb-text-secondary mr-2">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-cb-text-primary">
                        {secao.nome}
                      </div>
                      <div className="text-xs text-cb-text-secondary">
                        {secao.count} equipamentos
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-cb-text-primary">
                    {((secao.count / stats.totalComputadores) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>


      {/* Modal de Trocar Nome */}
      <AdminModal
        isOpen={showModal === 'name'}
        onClose={handleCloseModal}
        title="Trocar Nome"
      >
        <form onSubmit={handleSubmitName} className="space-y-4">
          <AdminInput
            label="Novo Nome"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Digite seu novo nome"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <AdminButton variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit">
              Salvar
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Modal de Trocar Email */}
      <AdminModal
        isOpen={showModal === 'email'}
        onClose={handleCloseModal}
        title="Trocar Email"
      >
        <form onSubmit={handleSubmitEmail} className="space-y-4">
          <AdminInput
            label="Novo Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Digite seu novo email"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <AdminButton variant="secondary" type="button" onClick={handleCloseModal}>
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
        isOpen={showModal === 'password'}
        onClose={handleCloseModal}
        title="Trocar Senha"
      >
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <AdminInput
            label="Senha Atual"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            placeholder="Digite sua senha atual"
            required
          />
          <AdminInput
            label="Nova Senha"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            placeholder="Digite sua nova senha"
            required
          />
          <AdminInput
            label="Confirmar Nova Senha"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Confirme sua nova senha"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <AdminButton variant="secondary" type="button" onClick={handleCloseModal}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit">
              Salvar
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Modal de Histórico de Auditoria */}
      {showAuditHistory && (
        <AuditHistory
          equipamentoId={showAuditHistory}
          onClose={() => setShowAuditHistory(null)}
        />
      )}
    </AdminDashboard>
  );
}

export default Dashboard;

