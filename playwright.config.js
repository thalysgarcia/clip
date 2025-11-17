// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuração do Playwright para testes E2E do CLIP2
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  
  /* Tempo máximo para um teste executar */
  timeout: 30 * 1000,
  
  expect: {
    /* Tempo máximo para assertions */
    timeout: 5000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar o build no CI se você deixar test.only no código */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI apenas */
  retries: process.env.CI ? 2 : 0,
  
  /* Limitar workers em CI, usar padrão localmente */
  workers: process.env.CI ? 1 : undefined,
  
  /* Configuração do reporter */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Coletar trace quando retentar o teste falho */
    trace: 'on-first-retry',
    
    /* Screenshots apenas quando falhar */
    screenshot: 'only-on-failure',
    
    /* Vídeo apenas quando falhar */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para múltiplos navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes mobile */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Servidor de desenvolvimento local */
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

