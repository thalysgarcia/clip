/**
 * Script para promover um usuário a administrador
 * 
 * INSTRUÇÕES:
 * 1. Abra o console do navegador (F12 ou Cmd+Option+I)
 * 2. Copie e cole este código completo no console
 * 3. Execute a função com o email do usuário que deseja promover
 * 
 * Exemplo:
 * promoteToAdmin('usuario@email.com')
 */

async function promoteToAdmin(email) {
  try {
    // Importar Firebase (já deve estar disponível na aplicação)
    const { collection, query, where, getDocs, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Usar a instância do Firestore da aplicação
    // Nota: Você precisará ajustar isso para usar o db da sua aplicação
    console.log('⚠️ Este script precisa ser executado dentro da aplicação CLIP2');
    console.log('📝 Alternativa: Use o console do Firebase para editar manualmente');
    console.log('');
    console.log('🔧 Para promover manualmente no Firebase Console:');
    console.log('1. Acesse: https://console.firebase.google.com');
    console.log('2. Vá em Firestore Database');
    console.log('3. Encontre o documento do usuário na coleção "users"');
    console.log('4. Adicione o campo "role" com valor "admin"');
    console.log('');
    console.log('💡 Ou execute este código no console do navegador DENTRO da aplicação:');
    console.log('');
    
    const code = `
// Cole este código no console do navegador DENTRO da aplicação CLIP2
(async function() {
  const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
  const { db } = await import('./services/firebaseConfig');
  
  const email = prompt('Digite o email do usuário que deseja promover a administrador:');
  if (!email) return;
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ Usuário não encontrado!');
      alert('Usuário não encontrado no Firestore!');
      return;
    }
    
    const userDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin'
    });
    
    console.log('✅ Usuário promovido a administrador!');
    alert('✅ Usuário promovido a administrador! Faça logout e login novamente.');
    
    // Atualizar localStorage se for o usuário atual
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.email === email) {
      currentUser.role = 'admin';
      localStorage.setItem('user', JSON.stringify(currentUser));
      console.log('✅ localStorage atualizado!');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao promover usuário: ' + error.message);
  }
})();
    `;
    
    console.log(code);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Exportar para uso
if (typeof window !== 'undefined') {
  window.promoteToAdmin = promoteToAdmin;
}

console.log('📋 Script carregado!');
console.log('💡 Para usar, execute: promoteToAdmin("email@exemplo.com")');
console.log('⚠️ Ou siga as instruções acima para promover manualmente no Firebase Console');

