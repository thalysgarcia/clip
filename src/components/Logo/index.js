import React from 'react';
import './logo.css';

function Logo({ size = 'medium', showText = true }) {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'logo-small';
      case 'large': return 'logo-large';
      default: return 'logo-medium';
    }
  };

  return (
    <div className={`logo-container ${getSizeClass()}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 100 100" className="logo-svg">
          {/* Computador/Desktop */}
          <rect x="20" y="35" width="35" height="25" rx="3" fill="#4ECDC4" stroke="#2C3E50" strokeWidth="2"/>
          <rect x="25" y="40" width="25" height="15" rx="2" fill="#2C3E50"/>
          
          {/* Base do computador */}
          <rect x="30" y="60" width="15" height="8" fill="#34495E"/>
          <rect x="25" y="68" width="25" height="3" fill="#34495E"/>
          
          {/* Lacre/Selo */}
          <circle cx="70" cy="30" r="12" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
          <path d="M65 30 L70 25 L75 30 L70 35 Z" fill="#FFFFFF"/>
          <circle cx="70" cy="30" r="3" fill="#E74C3C"/>
          
          {/* Linha de conexão */}
          <path d="M55 47 Q62 47 65 30" stroke="#4ECDC4" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* IP Address indicator */}
          <rect x="60" y="55" width="20" height="12" rx="2" fill="#3498DB" stroke="#2980B9" strokeWidth="1"/>
          <text x="70" y="63" textAnchor="middle" fontSize="6" fill="white" fontFamily="monospace">IP</text>
          
          {/* Network dots */}
          <circle cx="85" cy="25" r="2" fill="#95A5A6"/>
          <circle cx="90" cy="30" r="2" fill="#95A5A6"/>
          <circle cx="85" cy="35" r="2" fill="#95A5A6"/>
        </svg>
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-main">CLIP</span>
          <span className="logo-subtitle">Controle de Lacre IP</span>
        </div>
      )}
    </div>
  );
}

export default Logo;






