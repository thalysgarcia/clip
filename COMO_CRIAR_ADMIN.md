# Como Criar o Primeiro Administrador

Como todos os novos usuários são criados com `role: 'user'` por padrão, você precisa promover manualmente um usuário a administrador. Existem duas formas:

## Método 1: Via Firebase Console (Recomendado)

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto CLIP2
3. Vá em **Firestore Database**
4. Encontre a coleção **`users`**
5. Localize o documento do usuário que deseja promover (pelo email ou UID)
6. Clique no documento para editar
7. Adicione um novo campo:
   - **Campo:** `role`
   - **Tipo:** `string`
   - **Valor:** `admin`
8. Salve as alterações

## Método 2: Via Console do Navegador (Dentro da Aplicação)

1. Faça login na aplicação CLIP2
2. Abra o console do navegador (F12 ou Cmd+Option+I)
3. Cole e execute o seguinte código:

```javascript
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
```

4. Digite o email do usuário quando solicitado
5. Faça **logout e login novamente** para que as mudanças tenham efeito

## Após Promover

Depois de promover um usuário a administrador:

1. **Faça logout** da aplicação
2. **Faça login novamente** com o usuário promovido
3. Agora você terá acesso a:
   - Página **Administrador** (`/admin`)
   - Página **Import/Export** (`/import-export`)
   - Poderá promover/rebaixar outros usuários na página Administrador

## Verificar se Funcionou

Após fazer login novamente, você deve ver:
- O link "Administrador" na sidebar
- O link "Import/Export" na sidebar
- Badge "Administrador" ao lado do seu nome (se estiver na página de administração)

## Nota Importante

- Apenas usuários com `role: 'admin'` podem acessar as páginas administrativas
- Apenas administradores podem promover/rebaixar outros usuários
- Apenas administradores podem importar/exportar dados e deletar o banco de dados

