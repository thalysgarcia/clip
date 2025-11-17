/**
 * Fixtures personalizados para testes E2E
 */

import { test as base } from '@playwright/test';
import { login, logout, clearAuth } from './helpers/auth.js';

/**
 * Extensão do test base com autenticação
 */
export const test = base.extend({
  // Fixture para página autenticada
  authenticatedPage: async ({ page }, use) => {
    // Credenciais de teste (ajustar conforme necessário)
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'test123456';
    
    await clearAuth(page);
    await login(page, testEmail, testPassword);
    
    await use(page);
    
    // Limpar após o teste
    await clearAuth(page);
  },
  
  // Fixture para página não autenticada
  unauthenticatedPage: async ({ page }, use) => {
    await clearAuth(page);
    await use(page);
    await clearAuth(page);
  },
});

export { expect } from '@playwright/test';

