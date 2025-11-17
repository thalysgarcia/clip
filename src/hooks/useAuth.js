import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * 🔐 Hook customizado para gerenciar autenticação
 * 
 * Centraliza toda a lógica de autenticação que estava duplicada
 * em múltiplos componentes.
 * 
 * @returns {Object} { user, loading, logout, refreshUser }
 * 
 * @example
 * function Dashboard() {
 *   const { user, loading } = useAuth();
 *   
 *   if (loading) return <Loading />;
 *   
 *   return <div>Olá, {user.name}!</div>;
 * }
 */
export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se o usuário está logado
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          navigate('/login', { replace: true });
          setLoading(false);
          return;
        }

        const userObj = JSON.parse(userData);
        
        // Buscar nome de guerra atualizado do Firestore
        try {
          const nomeGuerra = await authService.getNomeGuerra();
          
          // Atualizar nome de guerra se encontrado
          if (nomeGuerra && nomeGuerra !== 'Usuário Anônimo' && nomeGuerra !== userObj.email) {
            userObj.nomeGuerra = nomeGuerra;
            userObj.name = nomeGuerra;
            localStorage.setItem('user', JSON.stringify(userObj));
          } else if (userObj.nomeGuerra && userObj.nomeGuerra !== userObj.email) {
            userObj.name = userObj.nomeGuerra;
          }
        } catch (error) {
          console.error('Erro ao carregar nome de guerra:', error);
          // Se houver erro, usar dados do localStorage mesmo assim
          if (userObj.nomeGuerra && userObj.nomeGuerra !== userObj.email) {
            userObj.name = userObj.nomeGuerra;
          }
        }

        setUser(userObj);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate('/login', { replace: true });
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  /**
   * Logout do usuário
   */
  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Força logout mesmo com erro
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  /**
   * Recarregar dados do usuário do Firestore
   */
  const refreshUser = async () => {
    try {
      const nomeGuerra = await authService.getNomeGuerra();
      if (nomeGuerra && user) {
        const updatedUser = {
          ...user,
          nomeGuerra,
          name: nomeGuerra
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  return {
    user,
    loading,
    logout,
    refreshUser
  };
}

