import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../Avatar';
import Logo from '../Logo';
import './header.css';

function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-logo">
        <Logo size="medium" showText={true} />
      </div>
      
      <nav className="header-nav">
        <Link to="/" className="nav-item">
          <span className="nav-icon">📊</span>
          Dashboard
        </Link>
        <Link to="/computadores" className="nav-item">
          <span className="nav-icon">💻</span>
          Equipamentos
        </Link>
        <Link to="/gerenciar-grupos" className="nav-item">
          <span className="nav-icon">📋</span>
          Seções e Tipos
        </Link>
      </nav>

      <div className="header-actions">
        <button className="icon-btn" title="Notificações">
          <span>🔔</span>
        </button>
        <button className="icon-btn" title="Modo escuro">
          <span>🌙</span>
        </button>
        <button className="icon-btn" title="Configurações">
          <span>⚙️</span>
        </button>
        <div className="user-menu">
          <Avatar name={user?.name || 'Usuário'} size="medium" />
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

