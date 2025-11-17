# 📁 Estrutura do Projeto Clip

## 🎯 Visão Geral
O **Clip** é uma aplicação React que vai ter um banco de dados no firebase, e objetivo e ter uma tabela com o nome dos computadores, e que guarde em uma tabela o IP e o número do lacre de cada computador, além disso tenho que manter o historico de IP e lacres para consultas.
---

## 📂 Estrutura de Pastas

### 🏠 **Raiz do Projeto**
```
primeflix/
├── node_modules/         # Dependências do projeto
├── public/               # Arquivos estáticos públicos
├── src/                  # Código fonte da aplicação
├── package.json          # Configurações e dependências
├── package-lock.json     # Lock das versões das dependências
└── README.md            # Documentação do projeto
```

### 🌐 **Pasta `public/`**
Contém arquivos estáticos que são servidos diretamente pelo servidor:
- `index.html` - Template HTML principal
- `favicon.ico` - Ícone da aplicação
- `logo192.png` / `logo512.png` - Logos da aplicação
- `manifest.json` - Configurações PWA
- `robots.txt` - Configurações para crawlers

### 💻 **Pasta `src/`** (Código Fonte Principal)

#### 📄 **Arquivos Principais**
- `index.js` - Ponto de entrada da aplicação React
- `App.js` - Componente raiz que configura o ToastContainer e as rotas
- `index.css` - Estilos globais da aplicação
- `routes.js` - Configuração das rotas da aplicação

#### 🧩 **Pasta `components/`**
Componentes reutilizáveis da aplicação:

##### 📋 **`Header/`**
- `index.js` - Componente de cabeçalho com navegação
- `header.css` - Estilos específicos do header
- **Função**: Navegação principal (logo CLIP + menu)

##### 🔧 **`services/`**
- `api.js` - Configuração do Axios para comunicação com a API do firebase
- **Função**: Centraliza as configurações da API (baseURL, interceptors, etc.)

#### 📱 **Pasta `pages/`**
Páginas/rotas da aplicação:


##### 🔐 **`Login/`**
- `index.js` - Página de login
- `LoginPage.css` - Estilo da página de login
- **Função**: Para fazer o acesso ao App.

##### 🏠 **`Dashbord/`**
- `index.js` - Página inicial exibe as funcionalidades.
- `homePage.css` - Estilos da página inicial
- **Função**: Exibe o total de computadores, total de ip e uma verificacao para ver se tem algum item duplicado, caso tenha informe qual é.

##### 🎬 **`Lacre/`**
- `index.js` - Página de detalhes dos Computadores atraves de um lacre específico
- `lacre.info.css` - Estilos da página de detalhes
- **Função**: Mostra informações detalhadas do computador.


##### ❤️ **`Computadores Cadastrados/`**
- `index.js` - Página de de Ip e MacAdress
- `favoritos.css` - Estilos da página de Ip e MacAdress
- **Função**: Gerencia e exibe a lista Ip e MacAdress

##### ❌ **`Erro/`**
- `index.js` - Página de erro 404
- `erro.css` - Estilos da página de erro
- **Função**: Página exibida quando uma rota não é encontrada

---

## 🔧 **Tecnologias Utilizadas**

### 📦 **Dependências Principais**
- **React 19.1.1** - Biblioteca principal para interface
- **React Router DOM 7.8.2** - Roteamento da aplicação
- **Axios 1.11.0** - Cliente HTTP para requisições à API
- **React Toastify 11.0.5** - Notificações toast
- **React Scripts 5.0.1** - Scripts de build e desenvolvimento

### 🎨 **Estrutura de Estilos**
- CSS modular por componente/página
- Estilos globais em `index.css`
- Cada componente tem seu próprio arquivo CSS

---

## 🚀 **Funcionalidades**

### 🎯 **Rotas da Aplicação**
- `/` - Página inicial (dashboard do sistema CLIP)
- `/lacre/:id` - Detalhes de um computador específico
- `/ip-macaddress` - Gerenciamento de IP e MAC Address
- `*` - Página de erro 404

### 🔌 **Integração com API**
- Consumo da API do firebase
- Exibição lista de computadores
- Exibiçāo lista de Ip e Macadress


### 🎨 **Interface**
- Design responsivo
- Navegação intuitiva
- Notificações toast para feedback
- Loading states para melhor UX

---

## 📋 **Padrões de Organização**

### 🏗️ **Arquitetura**
- **Componentização**: Cada funcionalidade em seu próprio componente
- **Separação de responsabilidades**: Services, components e pages separados
- **Roteamento centralizado**: Todas as rotas em `routes.js`
- **Estilos modulares**: CSS específico para cada componente

### 📁 **Convenções de Nomenclatura**
- Componentes em PascalCase
- Arquivos CSS com nome do componente
- Páginas organizadas em pastas individuais
- Services em camelCase

---

## 🎯 **Objetivo do Projeto**
Criar uma aplicação similar ao Pfsense que permite aos usuários:
1. Visualizar os lacres, macadress e ip de cada computador.
2. Ver detalhes completos dos computadores
3. Adicionar/remover lacres, ip e macadress
4. Navegar de forma intuitiva entre as seções

Esta estrutura segue as melhores práticas do React, mantendo o código organizado, reutilizável e escalável.
