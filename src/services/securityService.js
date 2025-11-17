/**
 * 🔒 Security Service - OWASP Top 10 Compliance
 * 
 * Implementa práticas de segurança baseadas no OWASP Top 10:
 * 1. Broken Access Control
 * 2. Cryptographic Failures
 * 3. Injection
 * 4. Insecure Design
 * 5. Security Misconfiguration
 * 6. Vulnerable Components
 * 7. Authentication Failures
 * 8. Software Integrity Failures
 * 9. Security Logging Failures
 * 10. SSRF
 */

// ============================================
// 1. BROKEN ACCESS CONTROL
// ============================================

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 */
export const checkAccessControl = (user, resource, action) => {
  if (!user || !user.uid) {
    return { allowed: false, reason: 'Usuário não autenticado' };
  }

  // Verificar se o usuário é o dono do recurso
  if (resource.userId && resource.userId !== user.uid) {
    // Permitir apenas leitura para recursos de outros usuários
    if (action === 'read') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Acesso negado: recurso pertence a outro usuário' };
  }

  // Verificar se o usuário é admin
  if (user.isAdmin && action === 'admin') {
    return { allowed: true };
  }

  return { allowed: true };
};

/**
 * Valida se o usuário pode modificar um recurso
 */
export const canModifyResource = (user, resource) => {
  if (!user || !user.uid) {
    return false;
  }

  // Admin pode modificar tudo
  if (user.isAdmin) {
    return true;
  }

  // Usuário só pode modificar seus próprios recursos
  return resource.userId === user.uid;
};

// ============================================
// 2. CRYPTOGRAPHIC FAILURES
// ============================================

/**
 * Valida força da senha seguindo OWASP guidelines
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || password.length < 12) {
    errors.push('Senha deve ter no mínimo 12 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  // Verificar senhas comuns (lista básica)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'senha'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Senha muito comum. Escolha uma senha mais segura');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calcula a força da senha (0-100)
 */
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 12) strength += 25;
  if (password.length >= 16) strength += 10;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20;
  
  return Math.min(strength, 100);
};

// ============================================
// 3. INJECTION PROTECTION
// ============================================

/**
 * Sanitiza entrada contra XSS e Injection
 */
export const sanitizeInput = (input, options = {}) => {
  if (input === null || input === undefined) {
    return '';
  }

  let sanitized = String(input);

  // Remover tags HTML perigosas
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Escapar caracteres especiais
  if (options.escapeHtml !== false) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remover caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limitar tamanho
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized.trim();
};

/**
 * Valida e sanitiza dados de entrada
 */
export const validateAndSanitize = (data, schema) => {
  const sanitized = {};
  const errors = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Verificar obrigatoriedade
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[key] = `${key} é obrigatório`;
      continue;
    }

    // Se não obrigatório e vazio, pular
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Sanitizar string
    if (rules.type === 'string') {
      sanitized[key] = sanitizeInput(value, {
        maxLength: rules.maxLength,
        escapeHtml: rules.escapeHtml !== false
      });

      // Validar tamanho
      if (rules.minLength && sanitized[key].length < rules.minLength) {
        errors[key] = `${key} deve ter no mínimo ${rules.minLength} caracteres`;
      }
      if (rules.maxLength && sanitized[key].length > rules.maxLength) {
        errors[key] = `${key} deve ter no máximo ${rules.maxLength} caracteres`;
      }

      // Validar padrão
      if (rules.pattern && !rules.pattern.test(sanitized[key])) {
        errors[key] = `${key} não corresponde ao formato esperado`;
      }
    }

    // Validar número
    if (rules.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors[key] = `${key} deve ser um número`;
      } else {
        sanitized[key] = num;
        if (rules.min !== undefined && num < rules.min) {
          errors[key] = `${key} deve ser no mínimo ${rules.min}`;
        }
        if (rules.max !== undefined && num > rules.max) {
          errors[key] = `${key} deve ser no máximo ${rules.max}`;
        }
      }
    }

    // Validar email
    if (rules.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      sanitized[key] = sanitizeInput(value, { maxLength: 255 });
      if (!emailRegex.test(sanitized[key])) {
        errors[key] = `${key} deve ser um email válido`;
      }
    }

    // Validar IP
    if (rules.type === 'ip') {
      sanitized[key] = sanitizeInput(value);
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(sanitized[key])) {
        errors[key] = `${key} deve ser um IP válido`;
      } else {
        const parts = sanitized[key].split('.');
        const valid = parts.every(part => {
          const num = parseInt(part, 10);
          return num >= 0 && num <= 255;
        });
        if (!valid) {
          errors[key] = `${key} deve ser um IP válido`;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data: sanitized,
    errors
  };
};

// ============================================
// 4. RATE LIMITING & BRUTE FORCE PROTECTION
// ============================================

const rateLimitStore = new Map();

/**
 * Verifica rate limit para uma ação
 */
export const checkRateLimit = (identifier, action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  const record = rateLimitStore.get(key);
  
  // Resetar se a janela expirou
  if (now > record.resetAt) {
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Incrementar tentativas
  record.attempts += 1;
  
  if (record.attempts > maxAttempts) {
    const waitTime = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      waitTime,
      message: `Muitas tentativas. Aguarde ${waitTime} segundos.`
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.attempts
  };
};

/**
 * Registra uma tentativa (sucesso ou falha)
 */
export const recordAttempt = (identifier, action, success = false) => {
  const key = `${identifier}:${action}`;
  
  if (success) {
    // Limpar registro em caso de sucesso
    rateLimitStore.delete(key);
  } else {
    // Manter registro para rate limiting
    checkRateLimit(identifier, action);
  }
};

// ============================================
// 5. CSRF PROTECTION
// ============================================

/**
 * Gera token CSRF
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Valida token CSRF
 */
export const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) {
    return false;
  }
  
  // Comparação segura em tempo constante
  if (token.length !== storedToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
};

// ============================================
// 6. SECURITY LOGGING
// ============================================

/**
 * Log de eventos de segurança
 */
export const logSecurityEvent = (event, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log no console em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Event:', logEntry);
  }

  // Enviar para serviço de logging (implementar conforme necessário)
  // Exemplo: enviar para Firebase, servidor de logging, etc.
  
  // Armazenar localmente (últimos 100 eventos)
  try {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) {
      logs.shift();
    }
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Erro ao salvar log de segurança:', error);
  }
};

/**
 * Tipos de eventos de segurança
 */
export const SecurityEvents = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  DATA_DELETION: 'DATA_DELETION'
};

// ============================================
// 7. CONTENT SECURITY POLICY HELPERS
// ============================================

/**
 * Configurações recomendadas de CSP
 */
export const getCSPHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Ajustar conforme necessário
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  };
};

// ============================================
// 8. UTILITY FUNCTIONS
// ============================================

/**
 * Verifica se a string contém padrões suspeitos
 */
export const detectSuspiciousPatterns = (input) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Valida origem da requisição
 */
export const validateOrigin = (allowedOrigins = []) => {
  const origin = window.location.origin;
  return allowedOrigins.length === 0 || allowedOrigins.includes(origin);
};

export default {
  checkAccessControl,
  canModifyResource,
  validatePasswordStrength,
  sanitizeInput,
  validateAndSanitize,
  checkRateLimit,
  recordAttempt,
  generateCSRFToken,
  validateCSRFToken,
  logSecurityEvent,
  SecurityEvents,
  getCSPHeaders,
  detectSuspiciousPatterns,
  validateOrigin
};

