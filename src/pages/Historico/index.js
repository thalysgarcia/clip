import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auditService } from '../../services/auditService';
import { computadoresAPI } from '../../services/api';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminButton } from '../../components/admin/AdminComponents';

function Historico() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [computadoresById, setComputadoresById] = useState({});
  const [hasComputadores, setHasComputadores] = useState(true);
  const [usersCache, setUsersCache] = useState({});

  const equipamentoId = searchParams.get('equipamentoId') || searchParams.get('equipmentId');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // Prevenir navegação duplicada
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    // 🔥 Carregar cache de usuários uma única vez
    const loadUsersCache = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const cache = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          cache[doc.id] = {
            nomeGuerra: data.nomeGuerra || data.nomeCompleto || data.email || 'Usuário Desconhecido',
            email: data.email,
            nomeCompleto: data.nomeCompleto
          };
        });
        
        console.log('📦 Cache de usuários carregado:', cache);
        setUsersCache(cache);
      } catch (error) {
        console.error('Erro ao carregar cache de usuários:', error);
      }
    };
    
    loadUsersCache();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Carregar nomes dos computadores para mapear entityId -> nome
        const computadores = await computadoresAPI.getAll();
        
        // ✅ Verificar se há computadores cadastrados
        setHasComputadores(computadores.length > 0);
        
        const map = {};
        computadores.forEach(c => { map[c.id?.toString()] = c.nome; });
        setComputadoresById(map);

        // Carregar histórico (por equipamento, se houver filtro)
        let data = [];
        if (equipamentoId) {
          data = await auditService.getEquipmentHistory(equipamentoId);
          // Se vazio, como fallback filtre a atividade recente por entityId
          if (!data || data.length === 0) {
            const recent = await auditService.getRecentActivity(300);
            data = recent.filter(e => (e.entityId?.toString() === equipamentoId.toString()));
          }
        } else {
          data = await auditService.getRecentActivity(200);
        }
        setHistorico(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [equipamentoId]);

  const rows = useMemo(() => {
    return historico
      .filter(entry => {
        const formatted = auditService.formatChange(entry);
        // Ocultar registros de update sem mudanças
        if (entry.action === 'update' && (!formatted.changes || formatted.changes.length === 0)) {
          return false;
        }
        return true;
      })
      .map(entry => {
        const formatted = auditService.formatChange(entry);
        
        // 🔥 MELHORADO: Buscar responsável com múltiplas estratégias
        let responsavel = entry.userName;
        
        // Estratégia 1: Se userName já existe e não é placeholder
        if (responsavel && responsavel !== '' && responsavel !== 'Usuário Anônimo' && responsavel !== 'Usuário Desconhecido') {
          // Já tem nome válido, usar ele
        } else if (entry.userId && usersCache[entry.userId]) {
          // Estratégia 2: Buscar do cache de usuários pelo userId
          responsavel = usersCache[entry.userId].nomeGuerra;
          console.log(`✅ Responsável encontrado no cache: ${responsavel} (UID: ${entry.userId})`);
        } else if (entry.userId) {
          // Estratégia 3: Tentar pegar do localStorage se for o usuário atual
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.uid === entry.userId) {
                responsavel = user.nomeGuerra || user.name || user.email;
                console.log(`✅ Responsável encontrado no localStorage: ${responsavel}`);
              }
            } catch (e) {
              console.error('Erro ao parsear userData:', e);
            }
          }
        }
        
        // Fallback final
        if (!responsavel || responsavel === '' || responsavel === 'Usuário Anônimo') {
          responsavel = 'Usuário Desconhecido';
          console.warn(`⚠️ Responsável não encontrado para entrada:`, {
            entryId: entry.id,
            userId: entry.userId,
            userName: entry.userName
          });
        }
        
        return {
          id: entry.id,
          data: formatted.time,
          equipamento: computadoresById[entry.entityId?.toString()] || entry.entityId,
          equipamentoId: entry.entityId?.toString() || entry.entityId,
          acao: entry.action,
          responsavel: responsavel,
          changes: formatted.changes
        };
      });
  }, [historico, computadoresById, usersCache]);

  if (!user) return null;

  return (
    <AdminDashboard currentPage="historico">
      <div className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-cb-text-primary sm:text-3xl sm:tracking-tight">
                {equipamentoId ? (
                  <>
                    <div className="whitespace-nowrap">Histórico do Equipamento:</div>
                    <div className="mt-1 break-words">{computadoresById[equipamentoId] || equipamentoId}</div>
                  </>
                ) : (
                  'Histórico de Equipamentos'
                )}
              </h1>
            </div>
            {equipamentoId && (
              <div className="hidden sm:flex flex-shrink-0">
                <AdminButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/historico', { replace: true });
                  }}
                  title="Ver histórico de todos os equipamentos"
                >
                  Ver Todos
                </AdminButton>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 mt-1 sm:mt-0">
            <p className="text-sm text-cb-text-secondary flex-1">
              Registro de todas as mudanças realizadas
            </p>
            {equipamentoId && (
              <div className="flex sm:hidden flex-shrink-0">
                <AdminButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/historico', { replace: true });
                  }}
                  title="Ver histórico de todos os equipamentos"
                >
                  Ver Todos
                </AdminButton>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <AdminCard>
            <div className="text-center py-8">
              <div className="text-cb-text-secondary">Carregando...</div>
            </div>
          </AdminCard>
        )}
        {error && (
          <AdminCard>
            <div className="text-center py-8 text-red-400">{error}</div>
          </AdminCard>
        )}

        {!loading && !error && !hasComputadores && (
          <AdminCard>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2 text-cb-text-primary">Nenhum histórico disponível</h3>
              <p className="mb-6 text-cb-text-secondary max-w-md">
                O histórico de mudanças aparecerá aqui quando você tiver computadores cadastrados e fizer alterações neles.
              </p>
              <AdminButton
                onClick={() => navigate('/computadores')}
              >
                📝 Cadastrar Primeiro Computador
              </AdminButton>
            </div>
          </AdminCard>
        )}

        {!loading && !error && hasComputadores && (
          <AdminCard>
            <div className="overflow-hidden w-full">
              <table className="w-full divide-y divide-cb-border table-fixed">
                    <thead className="bg-cb-card">
                      <tr>
                        <th className="hidden md:table-cell w-[15%] px-4 py-3 text-left text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Data</th>
                        <th className="w-[33%] md:w-[20%] px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Equipamento</th>
                        <th className="hidden md:table-cell w-[15%] px-4 py-3 text-left text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Ação</th>
                        <th className="w-[33%] md:w-[15%] px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">Responsável</th>
                        <th className="w-[34%] md:w-[20%] px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-cb-text-secondary uppercase tracking-wider whitespace-nowrap">
                          {equipamentoId ? 'Mudanças' : 'Ações'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-cb-card divide-y divide-cb-border">
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-2 sm:px-6 py-10 text-center">
                            <div className="flex flex-col items-center justify-center w-full">
                              {equipamentoId ? (
                                <>
                                  <div className="text-4xl mb-4">📝</div>
                                  <div className="text-cb-text-primary mb-2 text-lg font-medium">Este equipamento ainda não possui histórico de mudanças.</div>
                                  <div className="text-sm text-cb-text-secondary max-w-md">
                                    O histórico será criado quando você editar informações deste equipamento.
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-4xl mb-4">📝</div>
                                  <div className="text-cb-text-primary mb-2 text-lg font-medium">Nenhum registro de mudança ainda.</div>
                                  <div className="text-sm text-cb-text-secondary max-w-md">
                                    Comece cadastrando, editando ou excluindo equipamentos!
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      {rows.map((r, idx) => {
                            // Traduzir e estilizar ações
                            let acaoDisplay;
                            let acaoStyle = {};
                            
                            switch(r.acao) {
                              case 'create':
                                acaoDisplay = '➕ Criação';
                                acaoStyle = { color: '#10b981', fontWeight: '600' };
                                break;
                              case 'update':
                                acaoDisplay = '✏️ Edição';
                                acaoStyle = { color: '#3b82f6', fontWeight: '600' };
                                break;
                              case 'delete':
                                acaoDisplay = '🗑️ Exclusão';
                                acaoStyle = { color: '#ef4444', fontWeight: '600' };
                                break;
                              default:
                                acaoDisplay = r.acao;
                            }
                            
                            return (
                              <tr key={`${r.id || r.data}-${idx}`} className="hover:bg-cb-hover transition-colors duration-200">
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-cb-text-primary break-words">{r.data}</td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-cb-text-primary break-words">{r.equipamento}</td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-center">
                                  <span style={acaoStyle}>{acaoDisplay}</span>
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-cb-text-primary break-words">{r.responsavel}</td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-cb-text-primary">
                                  {equipamentoId ? (
                                    // Quando está vendo histórico de um equipamento específico, mostrar mudanças detalhadas
                                    r.changes && r.changes.length > 0 ? (
                                      <details className="text-left">
                                        <summary className="cursor-pointer text-cb-primary font-semibold hover:text-cb-primary-dark transition-colors duration-200 text-xs sm:text-sm">
                                          {r.changes.length} campo{r.changes.length > 1 ? 's' : ''} alterado{r.changes.length > 1 ? 's' : ''}
                                        </summary>
                                        <ul className="mt-2 pl-0 list-none space-y-2">
                                          {r.changes.map((c, i) => (
                                            <li key={i} className="mb-2 p-2 bg-cb-hover rounded-lg">
                                              <strong className="block mb-1 text-cb-primary text-xs sm:text-sm">{c.field}</strong> 
                                              <div className="text-xs sm:text-sm">
                                                <span className="text-red-400 font-medium">"{c.oldValue}"</span> 
                                                <span className="mx-2 text-cb-text-secondary">→</span>
                                                <span className="text-green-400 font-medium">"{c.newValue}"</span>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </details>
                                    ) : (
                                      <span className="text-cb-text-muted text-xs sm:text-sm">-</span>
                                    )
                                  ) : (
                                    // Quando está vendo histórico geral, mostrar botão para ver histórico do equipamento
                                    <div className="text-center">
                                      <AdminButton
                                        variant="secondary"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const targetUrl = `/historico?equipamentoId=${r.equipamentoId}&equipmentId=${r.equipamentoId}`;
                                          // Prevenir navegação duplicada
                                          if (window.location.pathname + window.location.search !== targetUrl) {
                                            navigate(targetUrl);
                                          }
                                        }}
                                        className="text-[10px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                      >
                                        <span className="hidden sm:inline">📝 </span>Histórico
                                      </AdminButton>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
            </div>
          </AdminCard>
        )}
      </div>
    </AdminDashboard>
  );
}

export default Historico;


