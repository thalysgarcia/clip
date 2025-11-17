/**
 * Helpers para autenticação nos testes E2E
 */

/**
 * Realiza login no sistema
 * @param {any} page - Página do Playwright
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 */
export async function login(page, email, password) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
  
  // Preencher formulário de login
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();
  
  // Aguardar redirecionamento após login
  await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
}

/**
 * Realiza logout do sistema
 * @param {any} page - Página do Playwright
 */
export async function logout(page) {
  // Procurar por menu de usuário ou botão de logout
  const userMenu = page.locator('[aria-label*="user"], [aria-label*="menu"], button:has-text("Sair")').first();
  
  if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userMenu.click();
    const logoutButton = page.locator('text=Sair, text=Logout, text=Sign out').first();
    await logoutButton.click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  }
}

/**
 * Verifica se o usuário está autenticado
 * @param {any} page - Página do Playwright
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated(page) {
  try {
    // Verificar se há token no localStorage ou se não está na página de login
    const isOnLoginPage = page.url().includes('/login');
    const hasUserInStorage = await page.evaluate(() => {
      return !!localStorage.getItem('user');
    });
    
    return !isOnLoginPage && hasUserInStorage;
  } catch {
    return false;
  }
}

/**
 * Limpa o estado de autenticação (localStorage)
 * @param {any} page - Página do Playwright
 */
export async function clearAuth(page) {
  await page.evaluate(() => {
    localStorage.removeItem('user');
    localStorage.clear();
  });
}

