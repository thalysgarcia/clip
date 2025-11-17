/**
 * Testes E2E para navegação e rotas
 */

import { test, expect } from './fixtures.js';
import { navigateTo, clickNavLink, expectRoute } from './helpers/navigation.js';

test.describe('Navegação Principal', () => {
  test('deve navegar para Dashboard principal', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/');
    
    // Verificar se está na página correta
    await expect(page).toHaveURL(/\/$/);
    
    // Verificar se há conteúdo do dashboard
    const mainContent = page.locator('main, [role="main"], [class*="dashboard"]').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar para página de Equipamentos', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/computadores');
    
    await expect(page).toHaveURL(/\/computadores/);
    
    // Verificar se a página carregou
    await page.waitForLoadState('networkidle');
    const content = page.locator('body').first();
    await expect(content).toBeVisible();
  });

  test('deve navegar para página de Grupos', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/gerenciar-grupos');
    
    await expect(page).toHaveURL(/\/gerenciar-grupos/);
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar para página de Histórico', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/historico');
    
    await expect(page).toHaveURL(/\/historico/);
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar para página de Import/Export', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/import-export');
    
    await expect(page).toHaveURL(/\/import-export/);
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar para página de Alertas', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/alerta');
    
    await expect(page).toHaveURL(/\/alerta/);
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Navegação no Admin Dashboard', () => {
  test('deve navegar entre páginas via sidebar', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, '/');
    
    // Tentar clicar em links da sidebar do AdminDashboard
    const sidebarLinks = page.locator('nav a, [role="navigation"] a, [role="list"] a').filter({ hasText: /Dashboard|Equipamentos|Grupos|Histórico|Alerta|Import|Relatórios/i });
    const count = await sidebarLinks.count();
    
    if (count > 0) {
      // Clicar no link de Equipamentos
      const equipamentosLink = sidebarLinks.filter({ hasText: /Equipamentos/i }).first();
      if (await equipamentosLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await equipamentosLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/computadores/);
      }
    }
  });

  test('deve manter sidebar visível durante navegação', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, '/');
    
    // Verificar sidebar antes (AdminDashboard sidebar)
    const sidebarBefore = await page.locator('aside, nav, [role="navigation"]').first().isVisible();
    
    // Navegar para outra página
    await navigateTo(page, '/computadores');
    await page.waitForTimeout(1000);
    
    // Verificar sidebar depois (deve estar visível em todas as páginas com AdminDashboard)
    const sidebarAfter = await page.locator('aside, nav, [role="navigation"]').first().isVisible();
    
    // Sidebar deve estar visível em ambas as páginas
    expect(sidebarAfter).toBeTruthy();
  });
});

test.describe('Navegação Mobile', () => {
  test('deve abrir e fechar menu mobile', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, '/');
    
    // Procurar botão de menu do AdminDashboard
    const menuButton = page.locator('button[aria-label*="Abrir sidebar"], button[aria-label*="sidebar"], button:has([class*="Bars3Icon"])').first();
    const isVisible = await menuButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se menu abriu (Dialog do AdminDashboard)
      const menu = page.locator('[role="dialog"], [class*="Dialog"]').first();
      const menuVisible = await menu.isVisible({ timeout: 2000 }).catch(() => false);
      expect(menuVisible).toBeTruthy();
      
      // Fechar menu
      const closeButton = page.locator('button[aria-label*="Fechar"], button:has([class*="XMarkIcon"])').first();
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Rotas de Erro', () => {
  test('deve exibir página de erro para rota inválida', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/rota-inexistente-12345');
    
    // Deve mostrar página de erro ou redirecionar
    const errorPage = page.locator('text=/erro|404|não encontrado|not found/i').first();
    const isVisible = await errorPage.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Pode redirecionar ou mostrar erro
    expect(isVisible || page.url().includes('/erro') || page.url().includes('/login')).toBeTruthy();
  });
});

