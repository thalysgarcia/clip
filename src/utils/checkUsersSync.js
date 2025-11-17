// Utilitário para verificar sincronização entre Firebase Authentication e Firestore
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Compara usuários do Firebase Authentication com a coleção 'users' do Firestore
 * 
 * IMPORTANTE: 
 * - Firebase Authentication: Usuários que podem fazer login (autenticação)
 * - Firestore 'users': Dados adicionais dos usuários (nomeGuerra, nomeCompleto, etc.)
 * 
 * Quando um usuário se registra:
 * 1. É criado no Firebase Authentication (pode fazer login)
 * 2. É criado um documento na coleção 'users' do Firestore com dados adicionais
 * 
 * Se um usuário existe no Authentication mas não no Firestore, significa que:
 * - O registro foi criado diretamente no console do Firebase, OU
 * - Houve um erro ao salvar no Firestore durante o registro
 */
export async function checkUsersSync() {
  try {
    // Buscar usuários do Firestore
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const firestoreUsers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Análise de Usuários:');
    console.log(`\n✅ Usuários na coleção 'users' do Firestore: ${firestoreUsers.length}`);
    
    if (firestoreUsers.length > 0) {
      console.log('\n📋 Lista de usuários no Firestore:');
      firestoreUsers.forEach((user, index) => {
        console.log(`${index + 1}. UID: ${user.uid}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Nome de Guerra: ${user.nomeGuerra || 'N/A'}`);
        console.log(`   Nome Completo: ${user.nomeCompleto || 'N/A'}`);
        console.log(`   Criado em: ${user.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('Os usuários no Firebase Authentication (console do Firebase) são diferentes');
    console.log('dos usuários na coleção "users" do Firestore.');
    console.log('\n📝 Diferenças:');
    console.log('- Firebase Auth: Apenas autenticação (email, senha, UID)');
    console.log('- Firestore "users": Dados completos (nomeGuerra, nomeCompleto, etc.)');
    console.log('\n💡 Para que um usuário apareça na aplicação:');
    console.log('Ele precisa existir TANTO no Authentication QUANTO no Firestore.');
    
    return {
      firestoreUsersCount: firestoreUsers.length,
      firestoreUsers: firestoreUsers
    };
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
    return {
      firestoreUsersCount: 0,
      firestoreUsers: [],
      error: error.message
    };
  }
}

