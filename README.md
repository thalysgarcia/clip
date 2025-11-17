# 🖥️ CLIP - Controle de Lacres e IP

![CLIP Banner](https://img.shields.io/badge/CLIP-Control%20System-8b00ff?style=for-the-badge)

Aplicação React para gerenciamento e controle de computadores, IPs e números de lacre usando **localStorage**.

## 🎯 Sobre o Projeto

O **CLIP** (Controle de Lacres e IP) é uma aplicação web desenvolvida em React que permite o gerenciamento completo de computadores em uma rede, mantendo registros de:
- 💻 Computadores cadastrados
- 🌐 Endereços IP
- 🏷️ MAC Addresses
- 🔒 Números de lacres
- 📊 Histórico de alterações

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com email/senha (simulado)
- Manutenção de sessão no localStorage

### 📊 Dashboard
- Visualização de estatísticas gerais
- Total de computadores cadastrados
- Total de IPs únicos
- Total de MAC Addresses
- Alertas de duplicidade
- Tabela com computadores cadastrados
- Status em tempo real

### 💻 Gerenciamento de Computadores
- Adicionar novos computadores
- Editar informações existentes
- Excluir computadores
- Busca por nome, IP ou MAC Address
- Visualização em cards

### 🏷️ Detalhes do Computador
- Informações completas do computador
- Histórico de alterações de IP e lacre
- Edição inline de dados
- Rastreamento de modificações

### 📋 Grupos
- Criação de grupos de computadores
- Organização por setores
- Gerenciamento de grupos
- Visualização de computadores por grupo

### 📤 Import/Export
- Exportar dados para CSV
- Importar dados de CSV
- Backup e restauração de dados

## 🚀 Tecnologias Utilizadas

- **React** 19.1.1 - Biblioteca JavaScript para interfaces
- **React Router DOM** 7.8.2 - Roteamento da aplicação
- **React Toastify** 11.0.5 - Notificações toast
- **Axios** 1.11.0 - Cliente HTTP
- **CSS3** - Estilização customizada
- **localStorage** - Armazenamento local de dados

## 📁 Estrutura do Projeto

```
CLIP2/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Avatar/
│   │   ├── Header/
│   │   └── Logo/
│   ├── contexts/
│   │   └── ThemeContext.js
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Computadores/
│   │   ├── LacreInfo/
│   │   ├── GerenciarGrupos/
│   │   ├── ImportExport/
│   │   ├── Alerta/
│   │   └── Erro/
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── routes.js
│   ├── index.js
│   └── index.css
├── package.json
├── .gitignore
└── README.md
```

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd CLIP2
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o projeto
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 💾 Armazenamento de Dados

O projeto usa **localStorage** para armazenar todos os dados:

### Dados Armazenados
- **computadores**: Lista de computadores cadastrados
- **grupos**: Grupos de computadores
- **historico**: Histórico de alterações
- **user**: Informações do usuário logado
- **theme**: Preferência de tema (claro/escuro)

### Estrutura dos Dados

**Computador:**
```json
{
  "id": 1,
  "nome": "INFOR-PC3",
  "ip": "10.170.79.2",
  "macAddress": "00:1a:2b:4d:5e:123",
  "lacre": "12345",
  "status": "João Silva",
  "secao": "TI",
  "dataCadastro": "2024-01-15",
  "ultimaAtualizacao": "2024-10-07"
}
```

**Grupo:**
```json
{
  "id": 1,
  "nome": "Setor Administrativo",
  "descricao": "Computadores do setor administrativo",
  "computadores": ["ADMIN-PC1", "ADMIN-PC2"],
  "totalComputadores": 2,
  "dataCriacao": "2024-01-15"
}
```

## 🎨 Design

O projeto segue um design moderno com:
- 🎨 Paleta de cores roxa/violeta (#8b00ff)
- 📱 Layout responsivo
- 🌙 Modo escuro disponível
- ✨ Animações suaves
- 🎯 Interface intuitiva

## 📱 Páginas

### `/login` - Login
Página de autenticação com login por email/senha.

### `/` - Dashboard
Página principal com visão geral do sistema, estatísticas e tabela de computadores.

### `/computadores` - Computadores
Gerenciamento completo de computadores com busca e filtros.

### `/lacre/:id` - Detalhes do Computador
Visualização detalhada e histórico de um computador específico.

### `/gerenciar-grupos` - Grupos
Criação e gerenciamento de grupos de computadores.

### `/alerta` - Alertas
Resolução de problemas de duplicação de IPs, MACs e lacres.

### `/import-export` - Import/Export
Importar e exportar dados em formato CSV.

### `*` - Erro 404
Página de erro para rotas não encontradas.

## 🔒 Segurança

- Validação de formulários
- Sanitização de dados
- Proteção de rotas (redirecionamento para login)
- Armazenamento seguro no localStorage

## 🚀 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `build/`.

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejeta a configuração do Create React App

## 💡 Vantagens do localStorage

- ✅ **Simplicidade**: Não precisa de servidor ou banco de dados
- ✅ **Performance**: Acesso instantâneo aos dados
- ✅ **Offline**: Funciona sem conexão com internet
- ✅ **Privacidade**: Dados ficam apenas no navegador
- ✅ **Portabilidade**: Fácil backup e restauração

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fork o projeto
2. Criar uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

## 👥 Autor

Desenvolvido com ❤️ por Thalys Garcia

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](../../issues) descrevendo o problema.

## 📮 Contato

Para dúvidas ou sugestões, entre em contato através do GitHub.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!