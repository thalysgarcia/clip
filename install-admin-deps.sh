#!/bin/bash

# Script para instalar dependências do Admin Dashboard
# Execute este script se houver problemas de permissão com npm

echo "🔧 Corrigindo permissões do cache do npm..."
sudo chown -R $(whoami) ~/.npm 2>/dev/null || echo "⚠️  Não foi possível corrigir permissões automaticamente"

echo ""
echo "📦 Instalando dependências..."
npm install @headlessui/react@latest @heroicons/react@latest tailwindcss autoprefixer postcss

echo ""
echo "✅ Verificando instalação..."
npm list @headlessui/react @heroicons/react tailwindcss

echo ""
echo "🎉 Instalação concluída! Execute 'npm start' para testar."

