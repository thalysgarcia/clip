import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoutesApp from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { Component } from 'react';
import { initializeFirestoreCollections } from './utils/initializeFirestore';
import SecurityHeaders from './components/SecurityHeaders';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          color: '#333'
        }}>
          <h2>Algo deu errado!</h2>
          <p>Ocorreu um erro inesperado. Por favor, recarregue a página.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b00ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Inicializar coleções do Firestore quando o app carregar
  React.useEffect(() => {
    initializeFirestoreCollections();
  }, []);

  return (
    <ErrorBoundary>
      <SecurityHeaders />
      <ThemeProvider>
        <div className="App min-h-screen bg-white dark:bg-cb-background transition-colors duration-300">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <RoutesApp />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

