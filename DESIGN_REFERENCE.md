# Design Reference - Cultura Builder Hub

## Paleta de Cores

### Cores Principais
- **Background Principal (Dark)**: `#1A1A1A` ou `#0F0F0F` - Fundo escuro principal
- **Sidebar Background**: `#1A1A1A` - Fundo da sidebar
- **Sidebar Item Active**: Verde vibrante `#34D399` ou `#10B981` - Item ativo/selecionado
- **Sidebar Item Inactive**: `#FFFFFF` (branco) - Ícones inativos
- **Text Primary**: `#FFFFFF` - Texto principal branco
- **Text Secondary**: `#9CA3AF` ou `#6B7280` - Texto secundário cinza
- **Border/Divider**: `#374151` ou `#4B5563` - Bordas e divisores

### Cores de Estados
- **Hover**: `#374151` ou `#4B5563` - Background hover
- **Active**: Verde `#34D399` - Item ativo
- **Disabled**: `#6B7280` - Estado desabilitado

### Cores de Componentes
- **Button Primary**: Verde `#34D399` ou `#10B981`
- **Button Secondary**: Cinza `#6B7280`
- **Card Background**: `#1F2937` ou `#111827`
- **Input Background**: `#1F2937`
- **Input Border**: `#374151`

## Tipografia

### Família de Fontes
- **Primary Font**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Monospace**: 'Courier New', monospace (para código)

### Tamanhos
- **H1**: 2rem (32px) - Títulos principais
- **H2**: 1.5rem (24px) - Subtítulos
- **H3**: 1.25rem (20px) - Títulos de seção
- **Body**: 1rem (16px) - Texto padrão
- **Small**: 0.875rem (14px) - Texto pequeno
- **XS**: 0.75rem (12px) - Texto extra pequeno

### Pesos
- **Bold**: 700 - Títulos e ênfase
- **Semibold**: 600 - Subtítulos
- **Medium**: 500 - Texto médio
- **Regular**: 400 - Texto padrão

## Componentes

### Sidebar
- **Largura Expandida**: 288px (72 * 4)
- **Largura Colapsada**: 64px (16 * 4)
- **Padding**: 16px quando expandida, 8px quando colapsada
- **Background**: `#1A1A1A`
- **Item Height**: 40px
- **Item Padding**: 12px horizontal, 8px vertical
- **Border Radius**: 8px (rounded-md)

### Botões
- **Primary**: Verde `#34D399`, texto branco, padding 12px 24px
- **Secondary**: Cinza `#6B7280`, texto branco
- **Border Radius**: 8px
- **Font Weight**: 500 (medium)
- **Hover**: Escurecer 10-15%

### Cards
- **Background**: `#1F2937`
- **Border**: `#374151` (opcional)
- **Border Radius**: 12px (rounded-xl)
- **Padding**: 20px
- **Shadow**: Sutil, `0 1px 3px rgba(0, 0, 0, 0.3)`

### Inputs
- **Background**: `#1F2937`
- **Border**: `#374151`
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Focus Border**: Verde `#34D399`

### Modais
- **Background**: `#1F2937`
- **Border Radius**: 16px (rounded-2xl)
- **Shadow**: `0 20px 25px -5px rgba(0, 0, 0, 0.5)`
- **Backdrop**: `rgba(0, 0, 0, 0.75)`

## Espaçamentos

### Padding
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **XL**: 32px

### Gap
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px

## Animações

### Transições
- **Duration**: 200ms para interações rápidas, 300ms para transições de layout
- **Easing**: `ease-in-out` para a maioria, `ease-out` para entradas

### Hover Effects
- **Opacity**: 0.8 no hover
- **Scale**: 1.02 no hover (botões)
- **Background**: Escurecer 10-15%

## Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile
- Sidebar: Overlay quando aberta
- Cards: Full width
- Tabelas: Scroll horizontal
- Botões: Full width em formulários

