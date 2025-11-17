# 🔒 Configuração das Regras do Firestore

## ⚠️ Problema de Permissões

Se você está vendo erros como "Missing or insufficient permissions" ao tentar carregar usuários, você precisa configurar as regras de segurança do Firestore.

## 📋 Como Configurar

### Opção 1: Via Console do Firebase (Recomendado)

1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Regras**
4. Cole o conteúdo do arquivo `firestore.rules` deste projeto
5. Clique em **Publicar**

### Opção 2: Via Firebase CLI

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Deploy das regras
firebase deploy --only firestore:rules
```

## 🔐 Regras Configuradas

As regras permitem:

- **Usuários autenticados** podem:
  - ✅ Ler todos os usuários (para admin)
  - ✅ Criar/atualizar/deletar seus próprios dados
  - ✅ Ler/escrever em `computadores`
  - ✅ Ler/escrever em `grupos`
  - ✅ Ler `audit_log` (mas não modificar)

- **Não autenticados**:
  - ❌ Não têm acesso a nenhuma coleção

## 🧪 Testar as Regras

Após configurar, recarregue a página de Relatórios (`/admin`) e verifique se os usuários são carregados corretamente.

## 📝 Nota de Segurança

As regras atuais permitem que qualquer usuário autenticado leia todos os usuários. Se você quiser restringir isso apenas para administradores, você pode:

1. Adicionar um campo `admin: true` nos documentos de usuários administradores
2. Atualizar as regras para verificar esse campo:

```javascript
allow read: if request.auth != null && 
  (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true);
```

