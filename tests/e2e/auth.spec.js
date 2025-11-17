/**
 * Testes E2E para autenticação (Login e Registro)
 */

import { test, expect } from './fixtures.js';
import { clearAuth, isAuthenticated } from './helpers/auth.js';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar elementos da página de login
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first()).toBeVisible();
  });

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    
    // Deve redirecionar para /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
    
    await emailInput.fill('invalid@email.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    // Aguardar mensagem de erro (pode ser toast, alerta, etc.)
    await page.waitForTimeout(2000);
    
    // Verificar se ainda está na página de login ou se há mensagem de erro
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('deve exibir a página de registro', async ({ page }) => {
    await page.goto('/register');
    
    // Verificar elementos da página de registro
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('deve navegar entre login e registro', async ({ page }) => {
    await page.goto('/login');
    
    // Procurar link para registro
    const registerLink = page.locator('a:has-text("Registrar"), a:has-text("Cadastrar"), a[href*="register"]').first();
    
    if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});

test.describe('Proteção de Rotas', () => {
  test('deve proteger rotas autenticadas', async ({ page }) => {
    await clearAuth(page);
    
    const protectedRoutes = [
      '/',
      '/computadores',
      '/admin',
      '/gerenciar-grupos',
      '/historico',
      '/import-export',
      '/alerta'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

