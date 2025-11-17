/**
 * Helpers para navegação nos testes E2E
 */

/**
 * Navega para uma rota específica
 * @param {any} page - Página do Playwright
 * @param {string} route - Rota para navegar (ex: '/admin', '/computadores')
 */
export async function navigateTo(page, route) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}

/**
 * Verifica se está na rota correta
 * @param {any} page - Página do Playwright
 * @param {string} expectedRoute - Rota esperada
 */
export async function expectRoute(page, expectedRoute) {
  await page.waitForURL(new RegExp(expectedRoute.replace('/', '\\/')), { timeout: 5000 });
}

/**
 * Clica em um link de navegação
 * @param {any} page - Página do Playwright
 * @param {string} linkText - Texto do link
 */
export async function clickNavLink(page, linkText) {
  const link = page.locator(`a:has-text("${linkText}"), [role="link"]:has-text("${linkText}")`).first();
  await link.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Verifica se a sidebar está visível (desktop)
 * @param {any} page - Página do Playwright
 * @returns {Promise<boolean>}
 */
export async function isSidebarVisible(page) {
  try {
    const sidebar = page.locator('[role="navigation"], nav, aside, [class*="sidebar"]').first();
    return await sidebar.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Abre o menu mobile (hamburger menu)
 * @param {any} page - Página do Playwright
 */
export async function openMobileMenu(page) {
  const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"], [class*="hamburger"]').first();
  if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await menuButton.click();
    await page.waitForTimeout(300); // Aguardar animação
  }
}

