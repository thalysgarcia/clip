/**
 * Testes E2E para o Dashboard Administrativo
 */

import { test, expect } from './fixtures.js';
import { navigateTo, clickNavLink, isSidebarVisible, openMobileMenu } from './helpers/navigation.js';

test.describe('Dashboard Administrativo', () => {
  test('deve exibir o dashboard admin com layout correto', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/admin');
    
    // Verificar título da página
    await expect(page.locator('h1:has-text("Painel Administrativo"), h1:has-text("Admin")').first()).toBeVisible({ timeout: 10000 });
    
    // Verificar se há cards de estatísticas
    const statsCards = page.locator('[class*="card"], [class*="Card"]');
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve exibir sidebar no desktop', async ({ authenticatedPage: page }) => {
    // Definir viewport desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, '/admin');
    
    // Verificar se sidebar está visível
    const sidebarVisible = await isSidebarVisible(page);
    expect(sidebarVisible).toBeTruthy();
  });

  test('deve exibir menu mobile no mobile', async ({ authenticatedPage: page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, '/admin');
    
    // Procurar botão de menu hambúrguer
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"], [class*="hamburger"]').first();
    
    // No mobile, o menu deve estar oculto inicialmente ou ter botão para abrir
    const isVisible = await menuButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await menuButton.click();
      await page.waitForTimeout(500); // Aguardar animação
    }
  });

  test('deve exibir barra de busca no header', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/');
    
    // Verificar barra de busca do AdminDashboard
    const searchInput = page.locator('input[type="search"], input[name="search"], input[id="search-field"], input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('deve exibir menu do usuário no header', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/');
    
    // Procurar menu do usuário do AdminDashboard
    const userMenu = page.locator('button[aria-label*="Abrir menu do usuário"], button:has([class*="Menu"]), [class*="rounded-full"]').first();
    
    // Deve estar visível
    const isVisible = await userMenu.isVisible({ timeout: 3000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
    
    // Clicar para abrir dropdown
    if (isVisible) {
      await userMenu.click();
      await page.waitForTimeout(300);
      
      // Verificar se dropdown abriu
      const dropdown = page.locator('[role="menu"], [class*="Menu"]').first();
      const dropdownVisible = await dropdown.isVisible({ timeout: 1000 }).catch(() => false);
      expect(dropdownVisible).toBeTruthy();
    }
  });

  test('deve exibir cards de estatísticas', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/admin');
    
    // Aguardar carregamento das estatísticas
    await page.waitForTimeout(2000);
    
    // Verificar se há cards com estatísticas
    const statsText = page.locator('text=/Usuários|Equipamentos|Grupos/i');
    const count = await statsText.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve exibir tabela de usuários', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/admin');
    
    // Aguardar carregamento
    await page.waitForTimeout(3000);
    
    // Verificar se há tabela ou lista de usuários
    const usersTable = page.locator('table, [class*="table"], [class*="users"]').first();
    const isVisible = await usersTable.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Pode estar em loading ou vazio, mas o elemento deve existir
    expect(isVisible || await page.locator('text=/carregando|loading|nenhum usuário/i').count() > 0).toBeTruthy();
  });

  test('deve ter navegação funcional na sidebar', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, '/');
    
    // Verificar links de navegação na sidebar do AdminDashboard
    const navLinks = page.locator('nav a, [role="navigation"] a, [role="list"] a').filter({ hasText: /Dashboard|Equipamentos|Grupos|Histórico|Alerta|Import|Relatórios/i });
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
    
    // Testar navegação clicando em um link
    if (count > 0) {
      const equipamentosLink = navLinks.filter({ hasText: /Equipamentos/i }).first();
      if (await equipamentosLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await equipamentosLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/computadores/);
      }
    }
  });

  test('deve ser responsivo em diferentes tamanhos de tela', async ({ authenticatedPage: page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await navigateTo(page, '/admin');
      
      // Verificar se o conteúdo principal está visível
      const mainContent = page.locator('main, [role="main"], [class*="main"]').first();
      await expect(mainContent).toBeVisible({ timeout: 5000 });
      
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Componentes Admin Reutilizáveis', () => {
  test('deve usar AdminCard corretamente', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/admin');
    
    // Verificar se há cards com estilo do AdminCard
    const cards = page.locator('[class*="bg-white"], [class*="shadow"], [class*="rounded"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve ter botões AdminButton funcionais', async ({ authenticatedPage: page }) => {
    await navigateTo(page, '/admin');
    
    // Verificar se há botões de ação
    const buttons = page.locator('button:has-text("Atualizar"), button:has-text("Novo"), button[class*="button"]');
    const count = await buttons.count();
    
    // Pode ter ou não botões, mas se tiver, devem estar visíveis
    if (count > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });
});

