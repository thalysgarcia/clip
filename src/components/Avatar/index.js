import React from 'react';
import './avatar.css';

function Avatar({ name, size = 'medium', className = '' }) {
  // Gera uma cor baseada no nome
  const getColorFromName = (name) => {
    if (!name) return '#8b00ff';
    
    const colors = [
      '#FF6B6B', // Vermelho
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul
      '#FFA07A', // Laranja
      '#98D8C8', // Verde água
      '#F7DC6F', // Amarelo
      '#BB8FCE', // Roxo
      '#85C1E2', // Azul claro
      '#F8B88B', // Pêssego
      '#AED6F1', // Azul bebê
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Pega as iniciais do nome
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const backgroundColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div 
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor }}
      title={name}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
}

export default Avatar;

