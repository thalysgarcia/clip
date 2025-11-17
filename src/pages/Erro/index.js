import { Link } from 'react-router-dom';
import './erro.css';

function Erro() {
  return (
    <div className="erro-container">
      <div className="erro-content">
        <h1 className="erro-code">404</h1>
        <h2 className="erro-title">Página não encontrada</h2>
        <p className="erro-message">
          Desculpe, mas a página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className="erro-btn">
          Voltar para o Dashboard
        </Link>
      </div>
      <div className="erro-illustration">
        <div className="erro-circle"></div>
        <div className="erro-circle-2"></div>
      </div>
    </div>
  );
}

export default Erro;

