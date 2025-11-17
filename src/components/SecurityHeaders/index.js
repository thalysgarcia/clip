/**
 * 🔒 Security Middleware Component
 * 
 * Componente React para aplicar headers de segurança e políticas CSP
 */

import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Aplicar headers de segurança via meta tags
    const applySecurityHeaders = () => {
      // Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        // CSP configurado diretamente para evitar dependência circular
        meta.content = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ');
        document.getElementsByTagName('head')[0].appendChild(meta);
      }

      // X-Content-Type-Options
      const contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-Content-Type-Options';
        meta.content = 'nosniff';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }

      // X-Frame-Options
      const frameOptionsMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!frameOptionsMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-Frame-Options';
        meta.content = 'DENY';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }

      // X-XSS-Protection
      const xssMeta = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
      if (!xssMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-XSS-Protection';
        meta.content = '1; mode=block';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }

      // Referrer Policy
      const referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'strict-origin-when-cross-origin';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
    };

    applySecurityHeaders();
  }, []);

  return null;
};

export default SecurityHeaders;

