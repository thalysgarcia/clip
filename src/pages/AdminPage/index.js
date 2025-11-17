import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { computadoresAPI, gruposAPI } from '../../services/api';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminButton, AdminModal, AdminInput, AdminTable, AdminTableRow, AdminTableCell, AdminSelect, AdminBadge } from '../../components/admin/AdminComponents';
import { UsersIcon, FolderIcon, TrashIcon, PencilIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

function AdminPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComputadores: 0,
    totalGrupos: 0
  });
  const [loadingUsers, setLoadingUsers] = useState(true); // Iniciar como true para mostrar loading
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nomeGuerra: '',
    nomeCompleto: '',
    role: 'user'
  });
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      toast.error('Acesso permitido apenas para administradores.');
      navigate('/', { replace: true });
      return;
    }
    
    // Carregar estatísticas (sem carregar usuários automaticamente para evitar erros)
    loadStats();
    // Carregar usuários silenciosamente
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersRef = collection(db, 'users');
      
      // Tentar carregar sem orderBy primeiro (mais seguro)
      let snapshot;
      try {
        // Tentar com orderBy se o campo existir
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (orderByError) {
        // Se orderBy falhar, carregar sem ordenação
        console.warn('Não foi possível ordenar por createdAt, carregando sem ordenação:', orderByError);
        snapshot = await getDocs(usersRef);
      }
      
      const usersList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          role: data.role || 'user'
        };
      });
      
      // Ordenar manualmente se necessário
      usersList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('✅ Usuários carregados:', usersList);
      console.log('📊 Total de usuários encontrados:', usersList.length);
      
      setUsers(usersList);
      setStats(prev => {
        const newStats = { ...prev, totalUsers: usersList.length };
        console.log('📈 Estatísticas atualizadas:', newStats);
        return newStats;
      });
      
      // Verificar sincronização e logar informações
      console.log('📊 Total de usuários na coleção "users" do Firestore:', usersList.length);
      console.log('\n⚠️ IMPORTANTE:');
      console.log('Os usuários no Firebase Authentication (console do Firebase) são diferentes');
      console.log('dos usuários na coleção "users" do Firestore.');
      console.log('\n📝 Explicação:');
      console.log('- Firebase Authentication: Usuários que podem fazer login');
      console.log('- Firestore "users": Dados completos dos usuários registrados na aplicação');
      console.log('\n💡 Para aparecer na aplicação, o usuário precisa existir em AMBOS:');
      console.log('1. Firebase Authentication (para fazer login)');
      console.log('2. Coleção "users" do Firestore (com nomeGuerra, nomeCompleto, etc.)');
      
      if (usersList.length > 0) {
        console.log('\n📋 Usuários registrados na aplicação (Firestore):');
        usersList.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email || 'N/A'} - ${user.nomeGuerra || user.nomeCompleto || 'Sem nome'}`);
        });
        // Evitar toast duplicado causado pelo React.StrictMode
        if (!hasShownToastRef.current) {
          toast.success(`${usersList.length} usuário(s) carregado(s) com sucesso!`);
          hasShownToastRef.current = true;
        }
      } else {
        console.warn('⚠️ Nenhum usuário encontrado na coleção "users" do Firestore');
        // Evitar toast duplicado causado pelo React.StrictMode
        if (!hasShownToastRef.current) {
          toast.info('Nenhum usuário encontrado na coleção "users" do Firestore');
          hasShownToastRef.current = true;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      
      // Mensagem mais específica para erros de permissão
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        toast.error(
          'Erro de permissão: Configure as regras do Firestore. Veja o console para mais detalhes.',
          { autoClose: 5000 }
        );
        console.error(
          '🔧 SOLUÇÃO: Você precisa configurar as regras do Firestore.\n' +
          '1. Acesse o Console do Firebase: https://console.firebase.google.com\n' +
          '2. Vá em Firestore Database > Regras\n' +
          '3. Cole as regras do arquivo firestore.rules do projeto\n' +
          '4. Ou execute: firebase deploy --only firestore:rules'
        );
      } else {
        toast.error(`Erro ao carregar usuários: ${error.message}`);
      }
      
      setUsers([]);
      setStats(prev => ({ ...prev, totalUsers: 0 }));
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadStats = async () => {
    try {
      const computadores = await computadoresAPI.getAll();
      const grupos = await gruposAPI.getAll();
      
      setStats(prev => ({
        ...prev,
        totalComputadores: computadores.length,
        totalGrupos: grupos.length
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      // Se for um Timestamp do Firestore
      if (dateString.toDate) {
        return dateString.toDate().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      nomeGuerra: user.nomeGuerra || '',
      nomeCompleto: user.nomeCompleto || '',
      role: user.role || 'user'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const userRef = doc(db, 'users', editingUser.id);
      const newRole = editFormData.role || 'user';
      await updateDoc(userRef, {
        nomeGuerra: editFormData.nomeGuerra,
        nomeCompleto: editFormData.nomeCompleto,
        role: newRole
      });
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.uid === editingUser.id || parsed.id === editingUser.id) {
          const updatedUser = { ...parsed, nomeGuerra: editFormData.nomeGuerra, nomeCompleto: editFormData.nomeCompleto, role: newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      toast.success('Usuário atualizado com sucesso!');
      setShowEditModal(false);
      setEditingUser(null);
      hasShownToastRef.current = false; // Resetar flag para permitir toast novamente
      loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      toast.success('Usuário excluído com sucesso!');
      hasShownToastRef.current = false; // Resetar flag para permitir toast novamente
      loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  return (
    <AdminDashboard currentPage="admin">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Painel Administrativo
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie usuários e visualize estatísticas do sistema
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>ℹ️ Importante:</strong> Os usuários no Firebase Authentication (console do Firebase) são diferentes dos usuários na coleção "users" do Firestore. 
              A aplicação usa a coleção "users" do Firestore, que contém informações adicionais como nome de guerra e nome completo.
            </p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Usuários Cadastrados</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {loadingUsers ? (
                      <span className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4] mr-2"></div>
                        Carregando...
                      </span>
                    ) : (
                      stats.totalUsers
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Equipamentos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalComputadores}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Grupos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalGrupos}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Lista de Usuários */}
        <div className="mb-8">
          <AdminCard title="Usuários Cadastrados no Sistema">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4]"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-400">Carregando usuários...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">⚠️ Nenhum usuário encontrado no sistema.</p>
                <AdminButton 
                  variant="secondary" 
                  onClick={() => {
                    hasShownToastRef.current = false; // Resetar flag para permitir toast novamente
                    loadUsers();
                  }}
                  className="mt-4"
                >
                  Tentar Carregar Novamente
                </AdminButton>
              </div>
            ) : (
              <AdminTable headers={['#', 'Nome de Guerra', 'Nome Completo', 'Email', 'Função', 'Data de Cadastro', 'Ações']}>
                {users.map((user, index) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>{index + 1}</AdminTableCell>
                    <AdminTableCell className="font-medium">{user.nomeGuerra || '-'}</AdminTableCell>
                    <AdminTableCell>{user.nomeCompleto || '-'}</AdminTableCell>
                    <AdminTableCell>{user.email}</AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={user.role === 'admin' ? 'primary' : 'default'}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>{formatDate(user.createdAt)}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex gap-2">
                        <AdminButton
                          variant="secondary"
                          onClick={() => handleEditUser(user)}
                          className="p-1"
                          title="Editar usuário"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-1"
                          title="Excluir usuário"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </AdminButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTable>
            )}
          </AdminCard>
        </div>

        {/* Ações Administrativas */}
        <div className="mb-8">
          <AdminCard title="Ações Administrativas">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-[#4ECDC4]" />
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-1">Gerenciamento de Usuários</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Edite ou exclua usuários do sistema. Use os botões na tabela acima para gerenciar cada usuário.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Estatísticas do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Equipamentos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalComputadores}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Grupos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalGrupos}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Uso</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalComputadores > 0 ? ((stats.totalComputadores / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Modal de Edição de Usuário */}
        <AdminModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          title="Editar Usuário"
        >
          {editingUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <AdminInput
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <AdminInput
                label="Nome de Guerra"
                type="text"
                value={editFormData.nomeGuerra}
                onChange={(e) => setEditFormData({ ...editFormData, nomeGuerra: e.target.value })}
              />
              <AdminInput
                label="Nome Completo"
                type="text"
                value={editFormData.nomeCompleto}
                onChange={(e) => setEditFormData({ ...editFormData, nomeCompleto: e.target.value })}
              />
              <AdminSelect
                label="Função"
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </AdminSelect>
              <div className="flex justify-end gap-3 pt-4">
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </AdminButton>
                <AdminButton onClick={handleUpdateUser}>
                  Salvar Alterações
                </AdminButton>
              </div>
            </div>
          )}
        </AdminModal>
      </div>
    </AdminDashboard>
  );
}

export default AdminPage;

