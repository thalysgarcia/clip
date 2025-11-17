import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminButton, AdminModal, AdminInput, AdminSelect } from '../../components/admin/AdminComponents';

function LacreInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [computer, setComputer] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [history, setHistory] = useState([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadComputerData();
    loadGrupos();
  }, [id, navigate]);


  const loadGrupos = () => {
    const storedGrupos = localStorage.getItem('grupos');
    if (storedGrupos) {
      setGrupos(JSON.parse(storedGrupos));
    }
  };

  const loadComputerData = () => {
    // Carregar do localStorage
    const storedComputadores = localStorage.getItem('computadores');
    
    if (storedComputadores) {
      const computadores = JSON.parse(storedComputadores);
      const computerData = computadores.find(c => c.id === parseInt(id));
      
      if (computerData) {
        setComputer(computerData);
      } else {
        toast.error('Computador não encontrado!');
        navigate('/computadores');
      }
    } else {
      // Dados de exemplo se não houver no localStorage
      const mockData = {
        id: parseInt(id),
        nome: 'INFOR-PC3',
        ip: '10.170.79.2',
        macAddress: '00:1a:2b:4d:5e:123',
        lacre: '12345',
        status: 'João Silva',
        secao: 'TI',
        dataCadastro: '2024-01-15',
        ultimaAtualizacao: '2024-10-07'
      };

      setComputer(mockData);
    }

    const mockHistory = [
      {
        id: 1,
        data: '2024-10-01',
        ip: '10.170.79.2',
        lacre: '12345',
        observacao: 'Atualização de IP'
      },
      {
        id: 2,
        data: '2024-09-15',
        ip: '10.170.79.1',
        lacre: '11111',
        observacao: 'Configuração inicial'
      }
    ];

    setHistory(mockHistory);
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

  const handleFieldClick = (field, currentValue) => {
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const handleFieldEdit = (field, newValue) => {
    // Atualizar no localStorage
    const storedComputadores = localStorage.getItem('computadores');
    if (storedComputadores) {
      const computadores = JSON.parse(storedComputadores);
      
      // Verificar duplicatas apenas para os campos relevantes
      if (field === 'ip') {
        const ipDuplicado = computadores.find(c => c.ip === newValue && c.id !== parseInt(id));
        if (ipDuplicado) {
          toast.warning(`⚠️ Alerta: O IP ${newValue} já está sendo usado pelo computador ${ipDuplicado.nome}`);
          return;
        }
      }
      
      if (field === 'macAddress') {
        const macDuplicado = computadores.find(c => c.macAddress === newValue && c.id !== parseInt(id));
        if (macDuplicado) {
          toast.warning(`⚠️ Alerta: O MAC Address ${newValue} já está sendo usado pelo computador ${macDuplicado.nome}`);
          return;
        }
      }
      
      if (field === 'lacre') {
        const lacreDuplicado = computadores.find(c => c.lacre === newValue && c.id !== parseInt(id));
        if (lacreDuplicado) {
          toast.warning(`⚠️ Alerta: O Lacre ${newValue} já está sendo usado pelo computador ${lacreDuplicado.nome}`);
          return;
        }
      }
      
      const updatedComputadores = computadores.map(comp => 
        comp.id === parseInt(id) ? { ...comp, [field]: newValue } : comp
      );
      localStorage.setItem('computadores', JSON.stringify(updatedComputadores));
      
      // Atualizar contagem dos grupos se for seção
      if (field === 'secao') {
        atualizarContagemGrupos(updatedComputadores);
      }
      
      // Atualizar o estado local
      const updatedComputer = { ...computer, [field]: newValue };
      setComputer(updatedComputer);
    }
    
    setEditingField(null);
    setEditingValue('');
    toast.success('Campo atualizado com sucesso!');
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      handleFieldEdit(field, editingValue);
    } else if (e.key === 'Escape') {
      handleFieldCancel();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!computer || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-cb-text-secondary">Carregando...</p>
      </div>
    );
  }

  return (
    <AdminDashboard currentPage="lacreinfo">
      <div className="space-y-6">
        <div>
          <div className="mb-4">
            <Link 
              to="/computadores" 
              className="text-sm text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
            >
              ← Voltar para Equipamentos
            </Link>
          </div>
          <h1 className="text-2xl font-bold leading-7 text-cb-text-primary sm:truncate sm:text-3xl sm:tracking-tight">
            {computer?.nome || 'Carregando...'}
          </h1>
          <p className="mt-1 text-sm text-cb-text-secondary">
            Informações detalhadas do equipamento
          </p>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-cb-text-primary mb-2">Informações do Computador</h2>
              <p className="text-sm text-cb-text-secondary">💡 Clique em qualquer campo para editar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Nome:</span>
                {editingField === 'nome' ? (
                  <AdminInput
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.nome) {
                        handleFieldEdit('nome', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'nome')}
                    autoFocus
                  />
                ) : (
                  <button 
                    className="text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer"
                    onClick={() => handleFieldClick('nome', computer.nome)}
                  >
                    {computer.nome}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">IP:</span>
                {editingField === 'ip' ? (
                  <AdminInput
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.ip) {
                        handleFieldEdit('ip', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'ip')}
                    autoFocus
                  />
                ) : (
                  <button 
                    className="text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer"
                    onClick={() => handleFieldClick('ip', computer.ip)}
                  >
                    {computer.ip}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">MAC Address:</span>
                {editingField === 'macAddress' ? (
                  <AdminInput
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.macAddress) {
                        handleFieldEdit('macAddress', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'macAddress')}
                    autoFocus
                  />
                ) : (
                  <button 
                    className="text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer"
                    onClick={() => handleFieldClick('macAddress', computer.macAddress)}
                  >
                    {computer.macAddress}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Lacre:</span>
                {editingField === 'lacre' ? (
                  <AdminInput
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.lacre) {
                        handleFieldEdit('lacre', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'lacre')}
                    autoFocus
                  />
                ) : (
                  <button 
                    className="text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer"
                    onClick={() => handleFieldClick('lacre', computer.lacre)}
                  >
                    {computer.lacre}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Status:</span>
                {editingField === 'status' ? (
                  <AdminInput
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.status) {
                        handleFieldEdit('status', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    onKeyDown={(e) => handleKeyPress(e, 'status')}
                    autoFocus
                  />
                ) : (
                  <button 
                    className="text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer"
                    onClick={() => handleFieldClick('status', computer.status)}
                  >
                    {computer.status}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Seção:</span>
                {editingField === 'secao' ? (
                  <AdminSelect
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      if (editingValue !== computer.secao) {
                        handleFieldEdit('secao', editingValue);
                      }
                      setEditingField(null);
                      setEditingValue('');
                    }}
                    autoFocus
                  >
                    <option value="">Sem seção</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.nome}>
                        {grupo.nome}
                      </option>
                    ))}
                  </AdminSelect>
                ) : (
                  <button 
                    className={`text-left text-cb-text-primary hover:text-cb-primary transition-colors duration-200 cursor-pointer ${!computer.secao ? 'text-cb-text-muted' : ''}`}
                    onClick={() => handleFieldClick('secao', computer.secao)}
                  >
                    {computer.secao || 'Não definida'}
                  </button>
                )}
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Data de Cadastro:</span>
                <span className="text-cb-text-primary">{computer.dataCadastro}</span>
              </div>
              <div className="flex flex-col space-y-1 pb-3 border-b border-cb-border last:border-b-0">
                <span className="text-sm font-semibold text-cb-text-secondary mb-1">Última Atualização:</span>
                <span className="text-cb-text-primary">{computer.ultimaAtualizacao}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Histórico de Alterações">
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-cb-border bg-cb-card border-l-4 border-l-cb-primary">
                  <div className="text-xs font-medium text-cb-text-secondary mb-2">{item.data}</div>
                  <div className="space-y-1 text-sm text-cb-text-primary">
                    <div><strong className="text-cb-text-secondary">IP:</strong> {item.ip}</div>
                    <div><strong className="text-cb-text-secondary">Lacre:</strong> {item.lacre}</div>
                    <div className="text-cb-text-muted mt-2">{item.observacao}</div>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminDashboard>
  );
}

export default LacreInfo;

