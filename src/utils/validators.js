/**
 * 🔍 Validadores de Dados - OWASP Compliant
 * 
 * Funções utilitárias para validar diferentes tipos de dados
 * antes de salvar no Firebase.
 * Integrado com securityService para proteção contra OWASP Top 10.
 */

import { sanitizeInput, detectSuspiciousPatterns } from '../services/securityService';

/**
 * Valida se uma string de IP é válida (IPv4)
 * @param {string} ip - IP para validar
 * @returns {boolean} true se válido
 */
export const isValidIP = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

/**
 * Valida se um MAC Address é válido
 * @param {string} mac - MAC Address para validar
 * @returns {boolean} true se válido
 */
export const isValidMAC = (mac) => {
  if (!mac || typeof mac !== 'string') return false;
  
  // Aceita formatos: XX:XX:XX:XX:XX:XX ou XX-XX-XX-XX-XX-XX
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
  return regex.test(mac);
};

/**
 * Valida se uma string não está vazia
 * @param {string} value - Valor para validar
 * @returns {boolean} true se não vazio
 */
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

/**
 * Valida se um email é válido
 * @param {string} email - Email para validar
 * @returns {boolean} true se válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida se uma senha é forte o suficiente
 * @param {string} password - Senha para validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return { valid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
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
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida se um valor está dentro de um range
 * @param {number} value - Valor para validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true se válido
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Valida dados de um computador antes de salvar
 * @param {Object} computador - Dados do computador
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateComputador = (computador) => {
  const errors = {};
  
  // Nome
  if (!isNotEmpty(computador.nome)) {
    errors.nome = 'Nome é obrigatório';
  }
  
  // IP
  if (computador.ip && !isValidIP(computador.ip)) {
    errors.ip = 'IP inválido. Use formato XXX.XXX.XXX.XXX';
  }
  
  // MAC Address
  if (computador.macAddress && !isValidMAC(computador.macAddress)) {
    errors.macAddress = 'MAC Address inválido. Use formato XX:XX:XX:XX:XX:XX';
  }
  
  // Tipo
  const tiposValidos = ['Servidor', 'Computador', 'Notebook', 'Impressora', 'Câmera', 'Switch', 'DVR', 'NVR'];
  if (computador.tipo && !tiposValidos.includes(computador.tipo)) {
    errors.tipo = `Tipo deve ser um dos seguintes: ${tiposValidos.join(', ')}`;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitiza uma string removendo caracteres perigosos (OWASP compliant)
 * @param {string} str - String para sanitizar
 * @returns {string} String sanitizada
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  // Usar sanitizeInput do securityService para proteção completa
  const sanitized = sanitizeInput(str, { escapeHtml: false });
  
  // Detectar padrões suspeitos
  if (detectSuspiciousPatterns(str)) {
    console.warn('⚠️ Padrão suspeito detectado na entrada:', str);
  }
  
  return sanitized;
};

/**
 * Valida dados de um grupo antes de salvar
 * @param {Object} grupo - Dados do grupo
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateGrupo = (grupo) => {
  const errors = {};
  
  if (!isNotEmpty(grupo.nome)) {
    errors.nome = 'Nome do grupo é obrigatório';
  }
  
  if (grupo.nome && grupo.nome.length > 50) {
    errors.nome = 'Nome do grupo deve ter no máximo 50 caracteres';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Exporta todas as validações
 */
export default {
  isValidIP,
  isValidMAC,
  isNotEmpty,
  isValidEmail,
  validatePassword,
  isInRange,
  validateComputador,
  validateGrupo,
  sanitizeString
};

