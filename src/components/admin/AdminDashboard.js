import { useState, Fragment, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlerts } from '../../hooks/useAlerts';
import { AdminModal, AdminInput, AdminButton } from './AdminComponents';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { computadoresAPI, gruposAPI } from '../../services/api';
import { auditService } from '../../services/auditService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: false },
  { name: 'Equipamentos', href: '/computadores', icon: FolderIcon, current: false },
  { name: 'Seções e Tipos', href: '/gerenciar-grupos', icon: UsersIcon, current: false },
  { name: 'Histórico', href: '/historico', icon: CalendarIcon, current: false },
  { name: 'Alerta', href: '/alerta', icon: ExclamationTriangleIcon, current: false },
  { name: 'Import/Export', href: '/import-export', icon: DocumentDuplicateIcon, current: false },
  { name: 'Administrador', href: '/admin', icon: ChartPieIcon, current: false },
];

const teams = [
  { id: 1, name: 'Administração', href: '#', initial: 'A', current: false },
  { id: 2, name: 'Suporte', href: '#', initial: 'S', current: false },
  { id: 3, name: 'TI', href: '#', initial: 'T', current: false },
];

const defaultUserNavigation = [
  { name: 'Seu perfil', href: '#' },
  { name: 'Sair', href: '/login' },
];

export default function AdminDashboard({ children, currentPage = 'admin', userNavigation = defaultUserNavigation }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('todos');
  const [searchData, setSearchData] = useState({
    computadores: [],
    grupos: [],
    secoes: [],
    historico: [],
    responsaveis: [],
  });
  const [isFetchingSearchData, setIsFetchingSearchData] = useState(false);
  const [searchInitialized, setSearchInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedSecao, setSelectedSecao] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedResponsavel, setSelectedResponsavel] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { alerts, alertCount, loading: alertsLoading } = useAlerts();

  // Get user from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userName = user?.nomeGuerra || user?.name || 'Usuário';
  const userEmail = user?.email || '';
  const isAdmin = user?.role === 'admin';
  
  // Função para mascarar email (mostrar apenas primeiros caracteres)
  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;
    return `${localPart.substring(0, 3)}**@${domain}`;
  };

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      toast.error('Não foi possível encerrar a sessão. Tente novamente.');
    } finally {
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };


  const handleProfileClick = (e) => {
    e.preventDefault();
    setShowProfileModal(true);
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const normalizeText = (value) => {
    if (!value && value !== 0) return '';
    return value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const loadSearchData = useCallback(async () => {
    if (isFetchingSearchData || searchInitialized) return;

    setIsFetchingSearchData(true);
    setSearchError(null);

    try {
      const [computadores, grupos] = await Promise.all([
        computadoresAPI.getAll(),
        gruposAPI.getAll(),
      ]);

      // Buscar histórico de auditoria do auditService
      let historico = [];
      try {
        historico = await auditService.getRecentActivity(500);
        console.log('📋 Histórico de auditoria carregado:', historico.length, 'registros');
      } catch (error) {
        console.error('Erro ao carregar histórico de auditoria:', error);
        // Fallback para localStorage
        const historicoRaw = localStorage.getItem('audit_log');
        if (historicoRaw) {
          try {
            historico = JSON.parse(historicoRaw);
          } catch (e) {
            console.error('Erro ao parsear histórico do localStorage:', e);
          }
        }
      }

      const sectionsMap = new Map();
      (computadores || []).forEach((comp) => {
        const secaoNome = comp.secao?.trim() || 'SEM SEÇÃO';
        if (!sectionsMap.has(secaoNome)) {
          sectionsMap.set(secaoNome, {
            nome: secaoNome,
            computadores: [],
          });
        }
        sectionsMap.get(secaoNome).computadores.push(comp);
      });

      const secoes = Array.from(sectionsMap.values())
        .map((secao) => ({
          nome: secao.nome,
          totalComputadores: secao.computadores.length,
          computadores: secao.computadores,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      // Processar responsáveis do histórico de auditoria
      const responsaveisMap = new Map();
      const computadoresMap = new Map();
      (computadores || []).forEach((comp) => {
        computadoresMap.set(comp.id?.toString(), comp);
        computadoresMap.set(comp.nome, comp);
      });

      (historico || []).forEach((item) => {
        // Usar userName do audit_log (pode ser userName ou responsavel)
        const responsavelNome = (item.userName || item.responsavel || 'Sem responsável')?.trim() || 'Sem responsável';
        
        if (!responsaveisMap.has(responsavelNome)) {
          responsaveisMap.set(responsavelNome, {
            nome: responsavelNome,
            equipamentos: [],
            acoes: [],
          });
        }

        // Buscar nome do equipamento pelo entityId
        let equipamentoNome = null;
        if (item.entityType === 'computador' && item.entityId) {
          const comp = computadoresMap.get(item.entityId.toString()) || 
                       computadoresMap.get(item.entityId);
          if (comp) {
            equipamentoNome = comp.nome;
          } else {
            // Se não encontrar, usar o entityId como fallback
            equipamentoNome = `Equipamento ${item.entityId}`;
          }
        }

        if (equipamentoNome) {
          // Verificar se o equipamento já está na lista deste responsável
          const equipamentoExistente = responsaveisMap.get(responsavelNome).equipamentos.find(
            e => e.nome === equipamentoNome
          );
          
          if (!equipamentoExistente) {
            responsaveisMap.get(responsavelNome).equipamentos.push({
              nome: equipamentoNome,
              acao: item.action || item.acao || 'Alteração',
              data: item.timestamp || item.data,
              entityId: item.entityId,
            });
          }
        }

        if (item.action || item.acao) {
          responsaveisMap.get(responsavelNome).acoes.push(item.action || item.acao);
        }
      });

      const responsaveis = Array.from(responsaveisMap.values())
        .map((resp) => ({
          nome: resp.nome,
          totalEquipamentos: resp.equipamentos.length,
          equipamentos: resp.equipamentos,
        }))
        .filter((resp) => resp.totalEquipamentos > 0) // Filtrar responsáveis sem equipamentos
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      setSearchData({
        computadores: computadores || [],
        grupos: grupos || [],
        secoes,
        historico,
        responsaveis,
      });
      setSearchInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar dados da busca global:', error);
      setSearchError('Não foi possível carregar os dados para busca.');
    } finally {
      setIsFetchingSearchData(false);
    }
  }, [isFetchingSearchData, searchInitialized]);

  const performSearch = useCallback(
    (value, filter) => {
      if (!searchInitialized) return;

      const trimmed = value.trim();
      const normalizedQuery = normalizeText(trimmed);
      const hasQuery = normalizedQuery.length > 0;

      setIsSearching(true);
      setSearchError(null);

      const results = [];

      const pushEquipamentoResult = (comp) => {
        results.push({
          type: 'equipamento',
          id: comp.id?.toString() || comp.id,
          nome: comp.nome || 'Equipamento sem nome',
          secao: comp.secao || 'SEM SEÇÃO',
          ip: comp.ip || 'Sem IP',
          macAddress: comp.macAddress || 'Sem MAC',
          lacre: comp.lacre || 'Sem lacre',
          status: comp.status || '',
          tipo: comp.tipo || '',
        });
      };

      // Se houver uma seção selecionada, mostrar apenas equipamentos dessa seção
      if (selectedSecao) {
        const equipamentosSecao = searchData.computadores.filter(
          (comp) => (comp.secao?.trim() || 'SEM SEÇÃO') === selectedSecao
        );
        equipamentosSecao.forEach(pushEquipamentoResult);
        setIsSearching(false);
        setSearchResults(results);
        return;
      }

      // Se houver um tipo selecionado, mostrar apenas equipamentos desse tipo
      if (selectedTipo) {
        const equipamentosTipo = searchData.computadores.filter(
          (comp) => (comp.tipo?.trim() || 'Sem tipo definido') === selectedTipo
        );
        equipamentosTipo.forEach(pushEquipamentoResult);
        setIsSearching(false);
        setSearchResults(results);
        return;
      }

      // Se houver um responsável selecionado, mostrar apenas equipamentos que ele alterou
      if (selectedResponsavel) {
        const responsavel = searchData.responsaveis.find(
          (r) => r.nome === selectedResponsavel
        );
        if (responsavel && responsavel.equipamentos) {
          responsavel.equipamentos.forEach((eq) => {
            // Tentar encontrar pelo nome primeiro
            let comp = searchData.computadores.find(
              (c) => c.nome === eq.nome
            );
            
            // Se não encontrar pelo nome, tentar pelo entityId
            if (!comp && eq.entityId) {
              comp = searchData.computadores.find(
                (c) => c.id?.toString() === eq.entityId.toString() || 
                       c.id === eq.entityId
              );
            }
            
            if (comp) {
              pushEquipamentoResult(comp);
            } else {
              // Se não encontrar o equipamento, ainda mostrar no resultado
              results.push({
                type: 'equipamento',
                id: eq.entityId?.toString() || `historico-${eq.nome}`,
                nome: eq.nome,
                secao: 'Histórico',
                ip: 'N/A',
                macAddress: 'N/A',
                lacre: 'N/A',
                status: eq.acao || 'Alteração',
                tipo: '',
              });
            }
          });
        }
        setIsSearching(false);
        setSearchResults(results);
        return;
      }

      if (filter === 'equipamentos') {
        // Se não houver busca, mostrar todos os tipos agrupados
        if (!hasQuery) {
          const groupedByType = new Map();

          searchData.computadores.forEach((comp) => {
            const typeName =
              (comp.tipo && comp.tipo.trim()) || 'Sem tipo definido';
            if (!groupedByType.has(typeName)) {
              groupedByType.set(typeName, []);
            }
            groupedByType.get(typeName).push(comp);
          });

          Array.from(groupedByType.entries())
            .sort(([, a], [, b]) => b.length - a.length)
            .forEach(([tipo, equipamentos]) => {
              results.push({
                type: 'equipamentoTipo',
                id: tipo,
                nome: tipo,
                totalEquipamentos: equipamentos.length,
                equipamentos,
              });
            });
        } else {
          // Se houver busca, filtrar e agrupar por tipo
          const source = searchData.computadores.filter((comp) => {
            const fieldsToSearch = [
              comp.nome,
              comp.ip,
              comp.macAddress,
              comp.lacre,
              comp.status,
              comp.secao,
              comp.tipo,
            ];
            return fieldsToSearch.some((field) =>
              normalizeText(field).includes(normalizedQuery)
            );
          });

          const groupedByType = new Map();

          source.forEach((comp) => {
            const typeName =
              (comp.tipo && comp.tipo.trim()) || 'Sem tipo definido';
            if (!groupedByType.has(typeName)) {
              groupedByType.set(typeName, []);
            }
            groupedByType.get(typeName).push(comp);
          });

          Array.from(groupedByType.entries())
            .sort(([, a], [, b]) => b.length - a.length)
            .forEach(([tipo, equipamentos]) => {
              results.push({
                type: 'equipamentoTipo',
                id: tipo,
                nome: tipo,
                totalEquipamentos: equipamentos.length,
                equipamentos,
              });
            });
        }
      } else if (filter === 'todos') {
        const source = hasQuery
          ? searchData.computadores.filter((comp) => {
              const fieldsToSearch = [
                comp.nome,
                comp.ip,
                comp.macAddress,
                comp.lacre,
                comp.status,
                comp.secao,
                comp.tipo,
              ];
              return fieldsToSearch.some((field) =>
                normalizeText(field).includes(normalizedQuery)
              );
            })
          : searchData.computadores;

        source.slice(0, 30).forEach(pushEquipamentoResult);
      }

      if (filter === 'responsavel') {
        // Se não houver busca, mostrar todos os responsáveis agrupados
        if (!hasQuery) {
          searchData.responsaveis.forEach((resp) => {
            results.push({
              type: 'responsavel',
              id: resp.nome,
              nome: resp.nome,
              totalEquipamentos: resp.totalEquipamentos,
              equipamentos: resp.equipamentos,
            });
          });
        } else {
          // Se houver busca, filtrar responsáveis
          const responsaveisFiltrados = searchData.responsaveis.filter((resp) =>
            normalizeText(resp.nome).includes(normalizedQuery)
          );

          responsaveisFiltrados.forEach((resp) => {
            results.push({
              type: 'responsavel',
              id: resp.nome,
              nome: resp.nome,
              totalEquipamentos: resp.totalEquipamentos,
              equipamentos: resp.equipamentos,
            });
          });
        }
      }

      if (filter === 'todos') {
        // Incluir grupos antigos no filtro "todos" para compatibilidade
        const gruposFiltrados = hasQuery
          ? searchData.grupos.filter((grupo) => {
              return (
                normalizeText(grupo.nome).includes(normalizedQuery) ||
                normalizeText(grupo.descricao).includes(normalizedQuery)
              );
            })
          : searchData.grupos;

        gruposFiltrados.slice(0, 20).forEach((grupo) => {
          results.push({
            type: 'grupo',
            id: grupo.id?.toString() || grupo.id,
            nome: grupo.nome,
            descricao: grupo.descricao || '',
            totalComputadores:
              grupo.totalComputadores ??
              (grupo.equipamento?.length || grupo.computadores?.length || 0),
          });
        });
      }

      const shouldIncludeSecoes =
        filter === 'secoes' || (filter === 'todos' && hasQuery);

      if (shouldIncludeSecoes) {
        const secoesFiltradas =
          filter === 'secoes' && !hasQuery
            ? searchData.secoes
            : searchData.secoes.filter((secao) =>
                normalizeText(secao.nome).includes(normalizedQuery)
              );

        secoesFiltradas.slice(0, 20).forEach((secao) => {
          results.push({
            type: 'secao',
            id: secao.nome,
            nome: secao.nome,
            totalComputadores: secao.totalComputadores,
            computadores: secao.computadores,
          });
        });
      }

      if (filter === 'todos' && hasQuery) {
        const historicoFiltrado = (searchData.historico || []).filter(
          (registro) =>
            normalizeText(registro.equipamento)?.includes(normalizedQuery) ||
            normalizeText(registro.acao)?.includes(normalizedQuery) ||
            normalizeText(registro.responsavel)?.includes(normalizedQuery)
        );

        historicoFiltrado.slice(0, 15).forEach((registro, index) => {
          results.push({
            type: 'historico',
            id: `historico-${index}-${registro.data}`,
            equipamento: registro.equipamento,
            acao: registro.acao,
            responsavel: registro.responsavel,
            data: registro.data,
          });
        });
      }

      setSearchResults(results);
      setIsSearching(false);
    },
    [searchData, searchInitialized, selectedSecao, selectedTipo, selectedResponsavel]
  );

  useEffect(() => {
    if (showSearchModal) {
      loadSearchData();
    }
  }, [showSearchModal, loadSearchData]);

  useEffect(() => {
    if (!showSearchModal) {
      setSearchValue('');
      setSearchResults([]);
      setSearchFilter('todos');
      setIsSearching(false);
      setSearchError(null);
      setSelectedSecao(null);
      setSelectedTipo(null);
      setSelectedResponsavel(null);
      return;
    }

    if (!searchInitialized) return;

    // Se houver filtros selecionados, mostrar resultados filtrados
    if (selectedSecao || selectedTipo || selectedResponsavel) {
      performSearch('', searchFilter);
      return;
    }

    // Se o filtro for "secoes" ou "equipamentos" ou "responsavel" sem busca, mostrar todos agrupados
    if (
      (searchFilter === 'secoes' || 
       searchFilter === 'equipamentos' || 
       searchFilter === 'responsavel') && 
      !searchValue.trim()
    ) {
      performSearch('', searchFilter);
      return;
    }

    if (searchValue.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    performSearch(searchValue, searchFilter);
  }, [
    showSearchModal,
    searchValue,
    searchFilter,
    performSearch,
    searchInitialized,
    selectedSecao,
    selectedTipo,
    selectedResponsavel,
  ]);

  const handleResultClick = useCallback(
    (result, event) => {
      if (!result) return;

      // Se for um clique em uma seção, navegar diretamente para Equipamentos com filtro
      if (result.type === 'secao') {
        event?.stopPropagation();
        setShowSearchModal(false);
        setSearchValue('');
        setSearchResults([]);
        setSearchFilter('todos');
        setSelectedSecao(null);
        setSelectedTipo(null);
        setSelectedResponsavel(null);

        const navigateWithDelay = (path) => {
          setTimeout(() => {
            navigate(path);
          }, 220);
        };

        const secaoFiltro = result.nome || 'SEM SEÇÃO';
        navigateWithDelay(
          `/computadores?filter=secao&value=${encodeURIComponent(secaoFiltro)}`
        );
        return;
      }

      if (result.type === 'equipamentoTipo') {
        event?.stopPropagation();
        // Fechar modal e navegar diretamente para Equipamentos com filtro
        setShowSearchModal(false);
        setSearchValue('');
        setSearchResults([]);
        setSearchFilter('todos');
        setSelectedSecao(null);
        setSelectedTipo(null);
        setSelectedResponsavel(null);

        const navigateWithDelay = (path) => {
          setTimeout(() => {
            navigate(path);
          }, 220);
        };

        const tipoFiltro = result.nome || 'Sem tipo definido';
        navigateWithDelay(
          `/computadores?filter=tipo&value=${encodeURIComponent(tipoFiltro)}`
        );
        return;
      }

      if (result.type === 'responsavel') {
        event?.stopPropagation();
        // Fechar modal e navegar diretamente para Equipamentos com filtro de responsável
        setShowSearchModal(false);
        setSearchValue('');
        setSearchResults([]);
        setSearchFilter('todos');
        setSelectedSecao(null);
        setSelectedTipo(null);
        setSelectedResponsavel(null);

        const navigateWithDelay = (path) => {
          setTimeout(() => {
            navigate(path);
          }, 220);
        };

        const responsavelFiltro = result.nome || 'Sem responsável';
        navigateWithDelay(
          `/computadores?filter=responsavel&value=${encodeURIComponent(responsavelFiltro)}`
        );
        return;
      }

      // Se for um equipamento individual, navegar para edição
      if (result.type === 'equipamento') {
        if (result?.fromTypeGroup) {
          setShowSearchModal(false);
          setSearchValue('');
          setSearchResults([]);
          setSearchFilter('todos');
          setSelectedSecao(null);
          setSelectedTipo(null);
          setSelectedResponsavel(null);

          const navigateWithDelay = (path) => {
            setTimeout(() => {
              navigate(path);
            }, 220);
          };

          const tipoFiltro = result.tipo || 'Sem tipo definido';
          navigateWithDelay(
            `/computadores?filter=tipo&value=${encodeURIComponent(tipoFiltro)}`
          );
          return;
        }

        setShowSearchModal(false);
        setSearchValue('');
        setSearchResults([]);
        setSearchFilter('todos');
        setSelectedSecao(null);
        setSelectedTipo(null);
        setSelectedResponsavel(null);

        const navigateWithDelay = (path) => {
          setTimeout(() => {
            navigate(path);
          }, 220);
        };

        const targetId = encodeURIComponent(result.id);
        navigateWithDelay(`/computadores?edit=${targetId}`);
        return;
      }

      // Para outros tipos, manter comportamento original
      setShowSearchModal(false);
      setSearchValue('');
      setSearchResults([]);
      setSearchFilter('todos');
      setSelectedSecao(null);
      setSelectedTipo(null);
      setSelectedResponsavel(null);

      const navigateWithDelay = (path) => {
        setTimeout(() => {
          navigate(path);
        }, 220);
      };

      if (result.type === 'grupo') {
        navigateWithDelay('/gerenciar-grupos');
      } else if (result.type === 'historico') {
        navigateWithDelay('/historico');
      }
    },
    [navigate]
  );

  const handleBackToFilters = () => {
    setSelectedSecao(null);
    setSelectedTipo(null);
    setSelectedResponsavel(null);
    setSearchValue('');
  };

  const handleSearchInputChange = (event) => {
    const { value } = event.target;
    setSearchValue(value);
    if (!searchInitialized) {
      loadSearchData();
    }
  };

  const handleSearchFilterChange = (newFilter) => {
    setSearchFilter(newFilter);
    setSelectedSecao(null);
    setSelectedTipo(null);
    setSelectedResponsavel(null);
    if (!searchInitialized) {
      loadSearchData();
    }
  };

  const resultTypeMetadata = {
    equipamento: {
      label: 'Equipamento',
      badgeClass: 'bg-emerald-500/10 text-emerald-300',
    },
    equipamentoTipo: {
      label: 'Tipo',
      badgeClass: 'bg-purple-500/10 text-purple-300',
    },
    grupo: {
      label: 'Seção',
      badgeClass: 'bg-sky-500/10 text-sky-300',
    },
    secao: {
      label: 'Seção',
      badgeClass: 'bg-indigo-500/10 text-indigo-200',
    },
    responsavel: {
      label: 'Responsável',
      badgeClass: 'bg-blue-500/10 text-blue-300',
    },
    historico: {
      label: 'Histórico',
      badgeClass: 'bg-amber-500/10 text-amber-200',
    },
  };

  // Update navigation current state based on currentPage
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: 
      (currentPage === 'dashboard' && item.href === '/') ||
      (currentPage === 'equipamentos' && item.href === '/computadores') ||
      (currentPage === 'grupos' && item.href === '/gerenciar-grupos') ||
      (currentPage === 'historico' && item.href === '/historico') ||
      (currentPage === 'alerta' && item.href === '/alerta') ||
      (currentPage === 'import-export' && item.href === '/import-export') ||
      (currentPage === 'admin' && item.href === '/admin') ||
      (currentPage === 'lacreinfo' && false) // LacreInfo não aparece na navegação principal
  }));

  const visibleNavigation = updatedNavigation.filter(item => {
    if (isAdmin) return true;
    return item.href !== '/admin' && item.href !== '/import-export';
  });

  return (
    <Fragment>
      <div className="w-full overflow-x-hidden">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Fechar sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className={classNames(
                    "flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 ring-1",
                    "bg-gray-50 dark:bg-cb-sidebar ring-white/10 dark:ring-white/10"
                  )}>
                    <div className="flex h-16 shrink-0 items-center">
                      <div className="text-2xl font-bold text-cb-text-primary">CLIP</div>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {visibleNavigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(item.href);
                                    setSidebarOpen(false);
                                  }}
                                  className={classNames(
                                    item.current
                                      ? 'bg-cb-hover text-cb-primary' 
                                      : 'text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover',
                                    'group flex gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200'
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current ? 'text-cb-primary' : 'text-cb-text-secondary group-hover:text-cb-text-primary',
                                      'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  <span className="text-cb-text-primary">{item.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs leading-6 font-semibold text-cb-text-secondary">Seus times</div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? 'bg-cb-hover text-cb-text-primary'
                                      : 'text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover',
                                    'group flex gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200'
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cb-border bg-cb-card text-[0.625rem] font-medium text-cb-text-secondary group-hover:text-cb-text-primary">
                                    {team.initial}
                                  </span>
                                  <span className="truncate text-cb-text-primary">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto">
                          {/* Profile Section */}
                          <Menu as="div" className="relative">
                            <Menu.Button className="group flex w-full items-center gap-x-3 rounded-lg px-3 py-3 text-sm hover:bg-cb-hover transition-colors duration-200">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cb-primary text-cb-text-primary font-semibold text-sm">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-1 flex-col items-start min-w-0">
                                <span className="text-sm font-semibold text-cb-text-primary truncate w-full">
                                  {userName}
                                </span>
                                <span className="text-xs text-cb-text-secondary truncate w-full">
                                  {maskEmail(userEmail)}
                                </span>
                              </div>
                              <div className="flex flex-col shrink-0 -space-y-1">
                                <ChevronUpIcon className="h-3 w-3 text-cb-text-secondary group-hover:text-cb-text-primary" />
                                <ChevronDownIcon className="h-3 w-3 text-cb-text-secondary group-hover:text-cb-text-primary" />
                              </div>
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className={classNames(
                                "absolute bottom-full left-0 mb-2 z-10 w-56 origin-bottom-left rounded-lg shadow-xl ring-1 focus:outline-none",
                                "bg-cb-card ring-cb-border"
                              )}>
                                <div className="py-1">
                                  {userNavigation.map((item) => (
                                    <Menu.Item key={item.name}>
                                      {({ active }) => (
                                        <a
                                          href={item.href}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            if (item.name === 'Sair') {
                                              handleSignOut();
                                            } else if (item.name === 'Seu perfil') {
                                              handleProfileClick(e);
                                            }
                                          }}
                                          className={classNames(
                                            active 
                                              ? 'bg-cb-hover' 
                                              : '',
                                            'block px-4 py-2.5 text-sm cursor-pointer text-cb-text-primary hover:bg-cb-hover transition-colors duration-200'
                                          )}
                                        >
                                          {item.name}
                                        </a>
                                      )}
                                    </Menu.Item>
                                  ))}
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                          </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Layout Mobile - Sem sidebar fixa */}
        <div className="lg:hidden flex flex-col min-h-screen bg-white dark:bg-cb-background transition-colors duration-300">
          {/* Header Mobile */}
          <div className={classNames(
            "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 sm:gap-x-6 sm:px-6",
            "border-cb-border bg-white dark:bg-cb-background w-full transition-colors duration-300"
          )}>
            <button 
              type="button" 
              className={classNames(
                "-m-2.5 p-2.5 transition-colors duration-200",
                "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
              )} 
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-cb-border" aria-hidden="true" />

            {/* Espaço flexível */}
            <div className="flex flex-1"></div>

            {/* Botões no canto superior direito */}
            <div className="flex items-center gap-x-2 flex-shrink-0">
              {/* Botão Buscar */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className={classNames(
                  "p-2 rounded-lg transition-colors duration-200",
                  "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                )}
                title="Buscar"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Toggle Dark Mode */}
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={classNames(
                  "p-2 rounded-lg transition-colors duration-200",
                  "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                )}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                <span className="sr-only">Alternar tema</span>
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              {/* Alerts dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className={classNames(
                  "relative p-2 rounded-lg transition-colors duration-200",
                  "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                )}>
                  <span className="sr-only">Ver notificações</span>
                  <BellIcon className="h-5 w-5" aria-hidden="true" />
                  {alertCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-cb-background">
                      <span className="sr-only">{alertCount} alertas</span>
                    </span>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className={classNames(
                    "absolute z-10 mt-2.5 rounded-md shadow-lg ring-1 focus:outline-none",
                    "bg-cb-card ring-cb-border",
                    "w-[calc(100vw-2rem)] max-w-sm",
                    "max-h-[calc(100vh-8rem)] overflow-y-auto",
                    "right-0",
                    "origin-top-right"
                  )}>
                    <div className="px-4 py-3 border-b border-cb-border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-cb-text-primary">
                          Alertas e Problemas
                        </h3>
                        {alertCount > 0 && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-900/30 text-red-200">
                            {alertCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto bg-cb-card">
                      {alertsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-sm text-cb-text-secondary">
                            Carregando alertas...
                          </div>
                        </div>
                      ) : alertCount === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-4xl mb-2">✅</div>
                          <div className="text-sm font-medium mb-1 text-cb-text-primary">
                            Nenhum alerta
                          </div>
                          <div className="text-xs text-cb-text-secondary">
                            Todos os equipamentos estão corretos
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          {alerts.slice(0, 10).map((alert, index) => (
                            <Menu.Item key={index}>
                              {({ active }) => (
                                <div
                                  onClick={() => navigate('/alerta')}
                                  className={classNames(
                                    "px-4 py-3 cursor-pointer transition-colors duration-200",
                                    active ? 'bg-cb-hover' : '',
                                    "text-cb-text-primary"
                                  )}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <span className="text-lg">⚠️</span>
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium truncate text-cb-text-primary">
                                          {alert.tipo}
                                        </p>
                                      </div>
                                      <p className="text-xs mt-1 truncate text-cb-text-secondary">
                                        {alert.valor}
                                      </p>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {alert.problemas.map((prob, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-900/30 text-red-200"
                                          >
                                            {prob}
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-xs mt-1 text-cb-text-muted">
                                        {alert.computadores.length} equipamento{alert.computadores.length > 1 ? 's' : ''} afetado{alert.computadores.length > 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          ))}
                          {alertCount > 10 && (
                            <div className="px-4 py-2 border-t border-cb-border text-center">
                              <button
                                onClick={() => navigate('/alerta')}
                                className="text-sm font-medium text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
                              >
                                Ver todos os {alertCount} alertas →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {alertCount > 0 && (
                      <div className="px-4 py-3 border-t border-cb-border bg-cb-card">
                        <button
                          onClick={() => navigate('/alerta')}
                          className="w-full text-center text-sm font-medium text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
                        >
                          Ver página de Alertas
                        </button>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Main Content Mobile */}
          <main className="flex-1 bg-white dark:bg-cb-background w-full min-w-0 overflow-x-hidden transition-colors duration-300">
            <div className="py-4 w-full">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full overflow-x-hidden">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Container flex para sidebar e conteúdo - Desktop */}
        <div className="hidden lg:flex lg:min-h-screen">
          {/* Static sidebar for desktop */}
          <div className={classNames(
            "flex flex-col transition-all duration-300 overflow-x-hidden flex-shrink-0 min-h-screen",
            sidebarCollapsed ? "w-16" : "w-72"
          )}>
            <div className={classNames(
              "flex flex-col transition-all duration-300 h-full overflow-y-auto",
              "bg-gray-50 dark:bg-cb-sidebar",
              sidebarCollapsed ? "px-2 py-4 overflow-x-hidden" : "px-6 pb-4"
            )}>
            {/* Header com logo e botão toggle */}
            <div className={classNames(
              "flex shrink-0 items-center transition-all duration-300",
              sidebarCollapsed ? "h-12 px-2 justify-center" : "h-16 px-0 justify-between"
            )}>
              {sidebarCollapsed ? (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className={classNames(
                    "flex items-center gap-2 p-2 rounded-md transition-colors duration-200",
                    "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                  )}
                  title="Expandir menu"
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                  <div className="h-4 w-px bg-cb-border"></div>
                  <ChevronDownIcon className="h-4 w-4 rotate-[-90deg]" />
                </button>
              ) : (
                <>
                  <div className="text-2xl font-bold text-cb-text-primary">CLIP</div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className={classNames(
                      "flex items-center gap-2 p-2 rounded-md transition-colors duration-200",
                      "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                    )}
                    title="Colapsar menu"
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                    <div className="h-4 w-px bg-cb-border"></div>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-1">
                <li>
                  <ul role="list" className="space-y-1">
                    {visibleNavigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.href);
                          }}
                          className={classNames(
                            item.current
                              ? 'bg-cb-hover text-cb-primary' 
                              : 'text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover',
                            sidebarCollapsed 
                              ? 'group flex justify-center rounded-lg p-3' 
                              : 'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                            'transition-all duration-200'
                          )}
                          title={sidebarCollapsed ? item.name : ''}
                        >
                          <item.icon
                            className={classNames(
                              item.current 
                                ? 'text-cb-primary' 
                                : 'text-cb-text-secondary group-hover:text-cb-text-primary',
                              'h-5 w-5 shrink-0',
                              sidebarCollapsed ? 'mx-auto' : ''
                            )}
                            aria-hidden="true"
                          />
                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1 truncate text-cb-text-primary">{item.name}</span>
                            </>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                {!sidebarCollapsed && (
                  <li>
                    <div className="text-xs font-semibold text-cb-text-secondary px-3 mt-6 mb-2 uppercase tracking-wider">Seus times</div>
                    <ul role="list" className="space-y-1">
                      {teams.map((team) => (
                        <li key={team.name}>
                          <a
                            href={team.href}
                            className={classNames(
                              team.current
                                ? 'bg-cb-hover text-cb-text-primary'
                                : 'text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover',
                              'group flex gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200'
                            )}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cb-border bg-cb-card text-[0.625rem] font-medium text-cb-text-secondary group-hover:text-cb-text-primary">
                              {team.initial}
                            </span>
                            <span className="truncate text-cb-text-primary">{team.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {!sidebarCollapsed && (
                  <li className="mt-auto">
                    {/* Profile Section */}
                    <Menu as="div" className="relative">
                      <Menu.Button className="group flex w-full items-center gap-x-3 rounded-lg px-3 py-3 text-sm hover:bg-cb-hover transition-colors duration-200">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cb-primary text-cb-text-primary font-semibold text-sm">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-1 flex-col items-start min-w-0">
                          <span className="text-sm font-semibold text-cb-text-primary truncate w-full">
                            {userName}
                          </span>
                          <span className="text-xs text-cb-text-secondary truncate w-full">
                            {maskEmail(userEmail)}
                          </span>
                        </div>
                        <div className="flex flex-col shrink-0 -space-y-1">
                          <ChevronUpIcon className="h-3 w-3 text-cb-text-secondary group-hover:text-cb-text-primary" />
                          <ChevronDownIcon className="h-3 w-3 text-cb-text-secondary group-hover:text-cb-text-primary" />
                        </div>
                      </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className={classNames(
                        "absolute bottom-full left-0 mb-2 z-10 w-56 origin-bottom-left rounded-lg shadow-xl ring-1 focus:outline-none",
                        "bg-cb-card ring-cb-border"
                      )}>
                        <div className="py-1">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (item.name === 'Sair') {
                                      handleSignOut();
                                    } else if (item.name === 'Seu perfil') {
                                      handleProfileClick(e);
                                    }
                                  }}
                                  className={classNames(
                                    active 
                                      ? 'bg-cb-hover' 
                                      : '',
                                    'block px-4 py-2.5 text-sm cursor-pointer text-cb-text-primary hover:bg-cb-hover transition-colors duration-200'
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>

          {/* Conteúdo principal */}
          <div className="flex flex-col flex-1 min-w-0 w-full overflow-x-hidden">
            <div className={classNames(
              "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 sm:gap-x-6 sm:px-6 lg:px-8",
              "border-cb-border bg-white dark:bg-cb-background w-full transition-colors duration-300"
            )}>
            <button 
              type="button" 
              className={classNames(
                "-m-2.5 p-2.5 lg:hidden transition-colors duration-200",
                "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
              )} 
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-cb-border" aria-hidden="true" />

            {/* Espaço flexível */}
            <div className="flex flex-1"></div>

            {/* Botões no canto superior direito */}
            <div className="flex items-center gap-x-2 lg:gap-x-4 flex-shrink-0">
              {/* Botão Buscar */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className={classNames(
                  "p-2 rounded-lg transition-colors duration-200",
                  "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                )}
                title="Buscar"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Toggle Dark Mode */}
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={classNames(
                  "p-2 rounded-lg transition-colors duration-200",
                  "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                )}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                <span className="sr-only">Alternar tema</span>
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

                {/* Alerts dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className={classNames(
                    "relative p-2 rounded-lg transition-colors duration-200",
                    "text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover"
                  )}>
                    <span className="sr-only">Ver notificações</span>
                    <BellIcon className="h-5 w-5" aria-hidden="true" />
                    {alertCount > 0 && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-cb-background">
                        <span className="sr-only">{alertCount} alertas</span>
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className={classNames(
                      "absolute z-10 mt-2.5 rounded-md shadow-lg ring-1 focus:outline-none",
                      "bg-cb-card ring-cb-border",
                      "w-[calc(100vw-2rem)] max-w-sm sm:w-96",
                      "max-h-[calc(100vh-8rem)] overflow-y-auto",
                      "right-0 sm:right-0",
                      "origin-top-right sm:origin-top-right"
                    )}>
                      <div className="px-4 py-3 border-b border-cb-border">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-cb-text-primary">
                            Alertas e Problemas
                          </h3>
                          {alertCount > 0 && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-900/30 text-red-200">
                              {alertCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto bg-cb-card">
                        {alertsLoading ? (
                          <div className="px-4 py-8 text-center">
                            <div className="text-sm text-cb-text-secondary">
                              Carregando alertas...
                            </div>
                          </div>
                        ) : alertCount === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <div className="text-sm font-medium mb-1 text-cb-text-primary">
                              Nenhum alerta
                            </div>
                            <div className="text-xs text-cb-text-secondary">
                              Todos os equipamentos estão corretos
                            </div>
                          </div>
                        ) : (
                          <div className="py-2">
                            {alerts.slice(0, 10).map((alert, index) => (
                              <Menu.Item key={index}>
                                {({ active }) => (
                                  <div
                                    onClick={() => navigate('/alerta')}
                                    className={classNames(
                                      "px-4 py-3 cursor-pointer transition-colors duration-200",
                                      active ? 'bg-cb-hover' : '',
                                      "text-cb-text-primary"
                                    )}
                                  >
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0">
                                        <span className="text-lg">⚠️</span>
                                      </div>
                                      <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-medium truncate text-cb-text-primary">
                                            {alert.tipo}
                                          </p>
                                        </div>
                                        <p className="text-xs mt-1 truncate text-cb-text-secondary">
                                          {alert.valor}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {alert.problemas.map((prob, i) => (
                                            <span
                                              key={i}
                                              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-900/30 text-red-200"
                                            >
                                              {prob}
                                            </span>
                                          ))}
                                        </div>
                                        <p className="text-xs mt-1 text-cb-text-muted">
                                          {alert.computadores.length} equipamento{alert.computadores.length > 1 ? 's' : ''} afetado{alert.computadores.length > 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Menu.Item>
                            ))}
                            {alertCount > 10 && (
                              <div className="px-4 py-2 border-t border-cb-border text-center">
                                <button
                                  onClick={() => navigate('/alerta')}
                                  className="text-sm font-medium text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
                                >
                                  Ver todos os {alertCount} alertas →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {alertCount > 0 && (
                        <div className="px-4 py-3 border-t border-cb-border bg-cb-card">
                          <button
                            onClick={() => navigate('/alerta')}
                            className="w-full text-center text-sm font-medium text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
                          >
                            Ver página de Alertas
                          </button>
                        </div>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>

              </div>
            </div>

            <main className="flex-1 bg-white dark:bg-cb-background w-full min-w-0 overflow-x-hidden transition-colors duration-300">
              <div className="py-4 w-full">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modal de Perfil */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        user={user}
      />

      {/* Modal de Configurações */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Modal de Busca */}
      <Transition.Root show={showSearchModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowSearchModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-20 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-cb-card border border-cb-border text-left shadow-xl transition-all w-full max-w-2xl">
                  <div className="p-6">
                    {/* Barra de Busca */}
                    <form 
                      className="relative mb-4" 
                      onSubmit={(e) => {
                        e.preventDefault();
                        // Implementar busca aqui
                      }}
                    >
                      <label htmlFor="search-field-modal" className="sr-only">
                        Buscar
                      </label>
                      <MagnifyingGlassIcon
                        className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 pl-3 text-cb-text-secondary flex items-center"
                        aria-hidden="true"
                      />
                      <input
                        id="search-field-modal"
                        className={classNames(
                          "block h-12 w-full rounded-lg border border-cb-border py-0 pl-10 pr-10 text-sm transition-colors duration-200",
                          "bg-cb-input text-cb-text-primary placeholder:text-cb-text-muted",
                          "focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background"
                        )}
                        placeholder="Buscar equipamentos, grupos e histórico..."
                        type="search"
                        name="search"
                        value={searchValue}
                        onChange={handleSearchInputChange}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearchModal(false);
                          setSearchValue('');
                        }}
                        className="absolute right-0 inset-y-0 pr-3 flex items-center text-cb-text-secondary hover:text-cb-text-primary transition-colors duration-200"
                        title="Fechar busca"
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </form>

                    {/* Filtros */}
                    <div className="mb-4">
                      <div className="flex gap-2 border-b border-cb-border pb-3">
                        <button
                          type="button"
                          onClick={() => handleSearchFilterChange('todos')}
                          className={classNames(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                            searchFilter === 'todos'
                              ? "bg-white dark:bg-gray-100 text-gray-900"
                              : "bg-transparent text-cb-text-secondary hover:text-cb-text-primary"
                          )}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSearchFilterChange('equipamentos')}
                          className={classNames(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                            searchFilter === 'equipamentos'
                              ? "bg-white dark:bg-gray-100 text-gray-900"
                              : "bg-transparent text-cb-text-secondary hover:text-cb-text-primary"
                          )}
                        >
                          Equipamentos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSearchFilterChange('responsavel');
                            setSelectedResponsavel(null);
                          }}
                          className={classNames(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                            searchFilter === 'responsavel'
                              ? "bg-white dark:bg-gray-100 text-gray-900"
                              : "bg-transparent text-cb-text-secondary hover:text-cb-text-primary"
                          )}
                        >
                          Responsável
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSearchFilterChange('secoes')}
                          className={classNames(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                            searchFilter === 'secoes'
                              ? "bg-white dark:bg-gray-100 text-gray-900"
                              : "bg-transparent text-cb-text-secondary hover:text-cb-text-primary"
                          )}
                        >
                          Seções
                        </button>
                      </div>
                      <p className="text-xs text-cb-text-muted text-center mt-3">
                        Busque por nome, IP, seção ou descrição. Utilize os filtros para refinar.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Botão de voltar quando houver filtros selecionados */}
                      {(selectedSecao || selectedTipo || selectedResponsavel) && (
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={handleBackToFilters}
                            className="flex items-center gap-2 text-sm font-medium text-cb-primary hover:text-cb-primary-dark transition-colors duration-200"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                            Voltar
                          </button>
                          <p className="text-xs text-cb-text-secondary mt-1">
                            {selectedSecao && `Mostrando equipamentos da seção: ${selectedSecao}`}
                            {selectedTipo && `Mostrando equipamentos do tipo: ${selectedTipo}`}
                            {selectedResponsavel && `Mostrando equipamentos do responsável: ${selectedResponsavel}`}
                          </p>
                        </div>
                      )}

                      {isFetchingSearchData ? (
                        <div className="flex justify-center py-6">
                          <div className="w-10 h-10 border-4 border-cb-border border-t-cb-primary rounded-full animate-spin" />
                        </div>
                      ) : searchError ? (
                        <div className="rounded-lg border border-red-400/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                          {searchError}
                        </div>
                      ) : (searchFilter === 'secoes' || searchFilter === 'equipamentos' || searchFilter === 'responsavel') && searchResults.length === 0 && !selectedSecao && !selectedTipo && !selectedResponsavel ? (
                        <div className="rounded-lg border border-cb-border px-4 py-4 text-sm text-cb-text-secondary text-center">
                          {searchFilter === 'secoes' && 'Nenhuma seção encontrada. Digite o nome da seção para visualizar os equipamentos.'}
                          {searchFilter === 'equipamentos' && 'Nenhum tipo de equipamento encontrado.'}
                          {searchFilter === 'responsavel' && 'Nenhum responsável encontrado.'}
                        </div>
                      ) : searchValue.trim().length === 0 && searchFilter !== 'secoes' && searchFilter !== 'equipamentos' && searchFilter !== 'responsavel' && !selectedSecao && !selectedTipo && !selectedResponsavel ? (
                        <div className="rounded-lg border border-cb-border px-4 py-4 text-sm text-cb-text-secondary text-center">
                          Comece digitando para ver os resultados de busca.
                        </div>
                      ) : isSearching ? (
                        <div className="flex justify-center py-6">
                          <div className="w-10 h-10 border-4 border-cb-border border-t-cb-primary rounded-full animate-spin" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="rounded-lg border border-cb-border px-4 py-4 text-sm text-cb-text-secondary text-center">
                          Nenhum resultado encontrado para "{searchValue}".
                        </div>
                      ) : (
                        <ul className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
                          {searchResults.map((result) => {
                            const meta =
                              resultTypeMetadata[result.type] ||
                              resultTypeMetadata.equipamento;

                            if (result.type === 'secao') {
                              return (
                                <li key={`result-${result.type}-${result.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleResultClick(result)}
                                    className="w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-left transition-colors duration-200 hover:bg-cb-hover"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-cb-text-primary">
                                            {result.nome}
                                          </span>
                                          <span
                                            className={classNames(
                                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                              meta.badgeClass
                                            )}
                                          >
                                            {meta.label}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs text-cb-text-secondary">
                                          {result.totalComputadores}{' '}
                                          equipamento
                                          {result.totalComputadores !== 1
                                            ? 's'
                                            : ''}{' '}
                                          encontrados nesta seção.
                                        </p>
                                      </div>
                                    </div>
                                    {result.computadores?.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-[11px] uppercase tracking-wide text-cb-text-muted">
                                          Equipamentos
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {result.computadores
                                            .slice(0, 4)
                                            .map((comp) => (
                                              <button
                                                key={`secao-comp-${comp.id}`}
                                                type="button"
                                                onClick={(event) => {
                                                  event.stopPropagation();
                                                  handleResultClick({
                                                    type: 'equipamento',
                                                    id: comp.id,
                                                    nome: comp.nome,
                                                    secao: comp.secao,
                                                    ip: comp.ip,
                                                    macAddress: comp.macAddress,
                                                    lacre: comp.lacre,
                                                  });
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-cb-border bg-cb-card px-3 py-1 text-xs text-cb-text-secondary transition-colors duration-200 hover:bg-cb-hover"
                                              >
                                                <span className="font-medium text-cb-text-primary">
                                                  {comp.nome || 'Sem nome'}
                                                </span>
                                                {comp.ip && (
                                                  <span className="text-[11px] text-cb-text-muted">
                                                    {comp.ip}
                                                  </span>
                                                )}
                                              </button>
                                            ))}
                                          {result.computadores.length > 4 && (
                                            <span className="inline-flex items-center rounded-full border border-cb-border bg-cb-card px-3 py-1 text-xs text-cb-text-secondary">
                                              +{result.computadores.length - 4}{' '}
                                              outros
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                </li>
                              );
                            }

                            if (result.type === 'equipamentoTipo') {
                              return (
                                <li key={`result-${result.type}-${result.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleResultClick({
                                      type: 'equipamentoTipo',
                                      id: result.id,
                                      nome: result.nome
                                    })}
                                    className="w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-left transition-colors duration-200 hover:bg-cb-hover"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-cb-text-primary">
                                            {result.nome || 'Sem tipo'}
                                          </span>
                                          <span
                                            className={classNames(
                                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                              meta.badgeClass
                                            )}
                                          >
                                            {meta.label}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs text-cb-text-secondary">
                                          {result.totalEquipamentos}{' '}
                                          equipamento
                                          {result.totalEquipamentos !== 1 ? 's' : ''} cadastrados neste tipo.
                                        </p>
                                      </div>
                                    </div>
                                    {result.equipamentos?.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-[11px] uppercase tracking-wide text-cb-text-muted">
                                          Equipamentos
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {result.equipamentos.slice(0, 4).map((equip) => (
                                            <button
                                              key={`tipo-comp-${equip.id}`}
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleResultClick({
                                                  type: 'equipamento',
                                                  id: equip.id,
                                                  nome: equip.nome,
                                                  secao: equip.secao,
                                                  ip: equip.ip,
                                                  macAddress: equip.macAddress,
                                                  lacre: equip.lacre,
                                                  status: equip.status,
                                                  tipo: equip.tipo || result.nome,
                                                  fromTypeGroup: true,
                                                });
                                              }}
                                              className="inline-flex min-w-[140px] flex-col items-start rounded-xl border border-cb-border bg-cb-card px-3 py-2 text-left transition-colors duration-200 hover:bg-cb-hover"
                                            >
                                              <span className="text-sm font-medium text-cb-text-primary">
                                                {equip.nome || 'Sem nome'}
                                              </span>
                                              <span className="text-[11px] text-cb-text-muted">
                                                {equip.status
                                                  ? `Responsável: ${equip.status}`
                                                  : 'Responsável não informado'}
                                              </span>
                                              {equip.ip && (
                                                <span className="text-[11px] text-cb-text-muted">
                                                  {equip.ip}
                                                </span>
                                              )}
                                            </button>
                                          ))}
                                          {result.equipamentos.length > 4 && (
                                            <span className="inline-flex items-center rounded-full border border-cb-border bg-cb-card px-3 py-1 text-xs text-cb-text-secondary">
                                              +{result.equipamentos.length - 4}{' '}outros
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                </li>
                              );
                            }

                            if (result.type === 'responsavel') {
                              return (
                                <li key={`result-${result.type}-${result.id}`}>
                                  <button
                                    type="button"
                                    onClick={(event) => handleResultClick(result, event)}
                                    className="w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-left transition-colors duration-200 hover:bg-cb-hover"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-cb-text-primary">
                                            {result.nome}
                                          </span>
                                          <span
                                            className={classNames(
                                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                              meta.badgeClass
                                            )}
                                          >
                                            {meta.label}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs text-cb-text-secondary">
                                          {result.totalEquipamentos}{' '}
                                          equipamento
                                          {result.totalEquipamentos !== 1
                                            ? 's'
                                            : ''}{' '}
                                          alterado
                                          {result.totalEquipamentos !== 1
                                            ? 's'
                                            : ''}{' '}
                                          por este responsável.
                                        </p>
                                      </div>
                                    </div>
                                    {result.equipamentos?.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-[11px] uppercase tracking-wide text-cb-text-muted">
                                          Equipamentos
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {result.equipamentos
                                            .slice(0, 4)
                                            .map((eq, index) => (
                                              <button
                                                key={`responsavel-eq-${index}`}
                                                type="button"
                                                onClick={(event) => {
                                                  event.stopPropagation();
                                                  // Tentar encontrar pelo nome primeiro
                                                  let comp = searchData.computadores.find(
                                                    (c) => c.nome === eq.nome
                                                  );
                                                  
                                                  // Se não encontrar pelo nome, tentar pelo entityId
                                                  if (!comp && eq.entityId) {
                                                    comp = searchData.computadores.find(
                                                      (c) => c.id?.toString() === eq.entityId.toString() || 
                                                             c.id === eq.entityId
                                                    );
                                                  }
                                                  
                                                  if (comp) {
                                                    handleResultClick({
                                                      type: 'equipamento',
                                                      id: comp.id,
                                                      nome: comp.nome,
                                                      secao: comp.secao,
                                                      ip: comp.ip,
                                                      macAddress: comp.macAddress,
                                                      lacre: comp.lacre,
                                                    });
                                                  }
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-cb-border bg-cb-card px-3 py-1 text-xs text-cb-text-secondary transition-colors duration-200 hover:bg-cb-hover"
                                              >
                                                <span className="font-medium text-cb-text-primary">
                                                  {eq.nome || 'Sem nome'}
                                                </span>
                                                {eq.acao && (
                                                  <span className="text-[11px] text-cb-text-muted">
                                                    {eq.acao}
                                                  </span>
                                                )}
                                              </button>
                                            ))}
                                          {result.equipamentos.length > 4 && (
                                            <span className="inline-flex items-center rounded-full border border-cb-border bg-cb-card px-3 py-1 text-xs text-cb-text-secondary">
                                              +{result.equipamentos.length - 4}{' '}
                                              outros
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                </li>
                              );
                            }

                            if (result.type === 'historico') {
                              return (
                                <li key={`result-${result.type}-${result.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleResultClick(result)}
                                    className="w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-left transition-colors duration-200 hover:bg-cb-hover"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-cb-text-primary">
                                            {result.equipamento || 'Histórico'}
                                          </span>
                                          <span
                                            className={classNames(
                                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                              meta.badgeClass
                                            )}
                                          >
                                            {meta.label}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs text-cb-text-secondary">
                                          {result.acao || 'Ação não informada'}
                                        </p>
                                        <p className="mt-1 text-[11px] text-cb-text-muted">
                                          {result.responsavel
                                            ? `Responsável: ${result.responsavel}`
                                            : 'Responsável não informado'}
                                          {result.data
                                            ? ` • ${result.data}`
                                            : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                </li>
                              );
                            }

                            return (
                              <li key={`result-${result.type}-${result.id}`}>
                                <button
                                  type="button"
                                  onClick={() => handleResultClick(result)}
                                  className="w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-left transition-colors duration-200 hover:bg-cb-hover"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-cb-text-primary">
                                          {result.nome}
                                        </span>
                                        <span
                                          className={classNames(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                            meta.badgeClass
                                          )}
                                        >
                                          {meta.label}
                                        </span>
                                      </div>
                                      {result.type === 'equipamento' ? (
                                        <div className="mt-1 text-xs text-cb-text-secondary space-x-2">
                                          <span>{result.ip}</span>
                                          <span>•</span>
                                          <span>
                                            {result.status || 'Responsável não informado'}
                                          </span>
                                          {result.tipo && (
                                            <>
                                              <span>•</span>
                                              <span>{result.tipo}</span>
                                            </>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="mt-1 text-xs text-cb-text-secondary">
                                          {result.descricao ||
                                            `${result.totalComputadores || 0} equipamento${result.totalComputadores === 1 ? '' : 's'}`}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  );
}

// Componente Modal de Perfil
function ProfileModal({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState({
    nomeGuerra: '',
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        nomeGuerra: user.nomeGuerra || '',
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [isOpen, user]);

  const handleUpdateNomeGuerra = async (e) => {
    e.preventDefault();
    try {
      await authService.updateNomeGuerraByEmail(user.email, formData.nomeGuerra);
      toast.success('Nome de guerra atualizado com sucesso!');
      // Atualizar localStorage
      const updatedUser = { ...user, nomeGuerra: formData.nomeGuerra };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao atualizar nome de guerra');
      console.error(error);
    }
  };

  const handleUpdatePassword = async (e) => {
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
      toast.success('Senha atualizada com sucesso!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
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

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="Seu Perfil" size="lg">
      <div className="space-y-6">
        {/* Informações do Usuário */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Guerra
            </label>
            <div className="flex gap-2">
              <AdminInput
                type="text"
                value={formData.nomeGuerra}
                onChange={(e) => setFormData({ ...formData, nomeGuerra: e.target.value })}
                className="flex-1"
              />
              <AdminButton onClick={handleUpdateNomeGuerra}>
                Salvar
              </AdminButton>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Usuário
            </label>
            <AdminInput
              type="text"
              value={formData.name || user?.email || 'N/A'}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              O nome de usuário é o email de login e não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <AdminInput
              type="email"
              value={formData.email || user?.email || 'N/A'}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Alterar Senha
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <AdminInput
              label="Senha Atual"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
            <AdminInput
              label="Nova Senha"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
            />
            <AdminInput
              label="Confirmar Nova Senha"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">
                Atualizar Senha
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </AdminModal>
  );
}

// Componente Modal de Configurações
function SettingsModal({ isOpen, onClose, isDarkMode, toggleTheme }) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="Configurações" size="md">
      <div className="space-y-6">
        {/* Tema */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Aparência
          </h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Modo Escuro
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alternar entre tema claro e escuro
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className={classNames(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
                isDarkMode ? "bg-[#4ECDC4]" : "bg-gray-200"
              )}
            >
              <span
                className={classNames(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Sistema
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Versão</span>
              <span className="text-gray-900 dark:text-gray-100">CLIP 2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tema Atual</span>
              <span className="text-gray-900 dark:text-gray-100">
                {isDarkMode ? 'Escuro' : 'Claro'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <AdminButton variant="secondary" onClick={onClose}>
            Fechar
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}

