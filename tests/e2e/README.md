# Testes E2E com Playwright - CLIP2

## 📋 Visão Geral

Este diretório contém testes end-to-end (E2E) usando Playwright para garantir a qualidade e funcionalidade do CLIP2.

## 🚀 Como Executar

### Executar todos os testes
```bash
npm run test:e2e
```

### Executar com interface gráfica (UI Mode)
```bash
npm run test:e2e:ui
```

### Executar em modo visível (headed)
```bash
npm run test:e2e:headed
```

### Executar em modo debug
```bash
npm run test:e2e:debug
```

### Ver relatório HTML
```bash
npm run test:e2e:report
```

## 📁 Estrutura de Arquivos

```
tests/e2e/
├── helpers/
│   ├── auth.js          # Helpers para autenticação
│   └── navigation.js    # Helpers para navegação
├── fixtures.js          # Fixtures personalizados
├── auth.spec.js         # Testes de autenticação
├── admin-dashboard.spec.js  # Testes do dashboard admin
├── navigation.spec.js   # Testes de navegação
└── ui-components.spec.js    # Testes de componentes UI
```

## 🧪 Testes Disponíveis

### 1. Autenticação (`auth.spec.js`)
- Login e registro
- Proteção de rotas
- Redirecionamentos

### 2. Dashboard Admin (`admin-dashboard.spec.js`)
- Layout e componentes
- Sidebar e header
- Responsividade
- Componentes reutilizáveis

### 3. Navegação (`navigation.spec.js`)
- Navegação entre páginas
- Rotas protegidas
- Menu mobile
- Rotas de erro

### 4. Componentes UI (`ui-components.spec.js`)
- Estilos e Tailwind CSS
- Ícones (Heroicons)
- Acessibilidade
- Formulários

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.test` para credenciais de teste:

```env
TEST_EMAIL=test@example.com
TEST_PASSWORD=test123456
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Navegadores

Por padrão, os testes executam em:
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

Para executar apenas em um navegador:
```bash
npx playwright test --project=chromium
```

## 📊 Relatórios

Após executar os testes, um relatório HTML é gerado em `playwright-report/`.

Para visualizar:
```bash
npm run test:e2e:report
```

## 🔧 Helpers Disponíveis

### Autenticação
```javascript
import { login, logout, clearAuth, isAuthenticated } from './helpers/auth.js';

// Login
await login(page, 'email@example.com', 'password');

// Logout
await logout(page);

// Limpar autenticação
await clearAuth(page);

// Verificar se está autenticado
const authenticated = await isAuthenticated(page);
```

### Navegação
```javascript
import { navigateTo, clickNavLink, expectRoute } from './helpers/navigation.js';

// Navegar para rota
await navigateTo(page, '/admin');

// Clicar em link de navegação
await clickNavLink(page, 'Dashboard');

// Verificar rota
await expectRoute(page, '/admin');
```

## 🎯 Fixtures

### Página Autenticada
```javascript
test('meu teste', async ({ authenticatedPage: page }) => {
  // page já está autenticada
  await page.goto('/admin');
});
```

### Página Não Autenticada
```javascript
test('meu teste', async ({ unauthenticatedPage: page }) => {
  // page não está autenticada
  await page.goto('/login');
});
```

## 📝 Escrevendo Novos Testes

1. Crie um novo arquivo `.spec.js` em `tests/e2e/`
2. Importe fixtures e helpers necessários
3. Use `test.describe` para agrupar testes relacionados
4. Use `test` para cada caso de teste

Exemplo:
```javascript
import { test, expect } from './fixtures.js';

test.describe('Minha Feature', () => {
  test('deve fazer algo', async ({ authenticatedPage: page }) => {
    await page.goto('/minha-rota');
    await expect(page.locator('h1')).toHaveText('Título');
  });
});
```

## 🐛 Debugging

### Modo Debug
```bash
npm run test:e2e:debug
```

### Screenshots e Vídeos
Screenshots e vídeos são salvos automaticamente quando testes falham em:
- `test-results/`

### Trace Viewer
Para ver traces detalhados:
```bash
npx playwright show-trace trace.zip
```

## 📚 Recursos

- [Documentação Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

