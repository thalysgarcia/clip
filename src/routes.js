import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { useTheme } from './contexts/ThemeContext';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Equipamentos from './pages/Equipamentos';
import LacreInfo from './pages/LacreInfo';
import GerenciarGrupos from './pages/GerenciarGrupos';
import ImportExport from './pages/ImportExport';
import Alerta from './pages/Alerta';
import Historico from './pages/Historico';
import AdminPage from './pages/AdminPage';
import Erro from './pages/Erro';


function LoadingScreen() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`flex flex-col justify-center items-center h-screen bg-white dark:bg-cb-background transition-colors duration-300 w-full`}>
      <div className="text-5xl font-bold mb-6 tracking-wider text-cb-primary" style={{
        textShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
      }}>
        CLIP
      </div>
      <div className="w-12 h-12 border-4 rounded-full mb-4 animate-spin"
        style={{
          borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
          borderTopColor: '#22C55E'
        }}
      ></div>
      <div className="text-lg font-medium text-gray-600 dark:text-cb-text-secondary opacity-90">
        Carregando...
      </div>
    </div>
  );
}

function RoutesApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          // Sempre buscar do Firestore para garantir que o role está atualizado
          let storedUser = null;
          try {
            const userDoc = await getDoc(doc(db, 'users', authUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              storedUser = {
                uid: authUser.uid,
                email: authUser.email,
                nomeCompleto: data.nomeCompleto || '',
                nomeGuerra: data.nomeGuerra || data.nomeCompleto || authUser.email,
                role: data.role || 'user',
                createdAt: data.createdAt || new Date().toISOString()
              };
              // Sempre atualizar localStorage com dados do Firestore
              localStorage.setItem('user', JSON.stringify(storedUser));
            } else {
              // Se não existe no Firestore, usar localStorage como fallback
              const storedData = localStorage.getItem('user');
              if (storedData) {
                storedUser = JSON.parse(storedData);
              }
            }
          } catch (profileError) {
            console.error('Erro ao carregar perfil do usuário:', profileError);
            // Fallback para localStorage em caso de erro
            const storedData = localStorage.getItem('user');
            if (storedData) {
              storedUser = JSON.parse(storedData);
            }
          }

          setUser(
            storedUser || {
              uid: authUser.uid,
              email: authUser.email,
              nomeGuerra: authUser.displayName || authUser.email,
              role: 'user'
            }
          );
        } else {
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <Register />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/computadores" 
          element={user ? <Equipamentos /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/lacre/:id" 
          element={user ? <LacreInfo /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/gerenciar-grupos" 
          element={user ? <GerenciarGrupos /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/historico" 
          element={user ? <Historico /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/import-export" 
          element={
            user
              ? isAdmin
                ? <ImportExport />
                : <Navigate to="/" replace />
              : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/alerta" 
          element={user ? <Alerta /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={
            user
              ? isAdmin
                ? <AdminPage />
                : <Navigate to="/" replace />
              : <Navigate to="/login" />
          } 
        />
      
        <Route 
          path="*" 
          element={<Erro />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesApp;
