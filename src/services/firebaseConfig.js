import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 🔒 Configuração do Firebase usando variáveis de ambiente
// As credenciais agora estão protegidas no arquivo .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// ⚠️ Validar que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey) {
  console.error('🔴 ERRO: Variáveis de ambiente do Firebase não foram carregadas!');
  console.error('📝 Certifique-se de que o arquivo .env existe na raiz do projeto.');
  console.error('💡 Copie o arquivo .env.example para .env e preencha com suas credenciais.');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;


