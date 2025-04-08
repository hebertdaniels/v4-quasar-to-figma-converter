import { quasarColors } from '../data/color-map';

/**
 * Processa uma classe do Quasar para extrair valores de estilo
 */
export function processQuasarClass(className: string) {
  // Classes de espaçamento (q-pa-*, q-ma-*)
  if (className.match(/^q-[mp][atrblxy]?-([a-z]+)$/)) {
    return processSpacingClass(className);
  }
  
  // Classes de texto (text-h1, text-caption, etc)
  if (className.match(/^text-([a-h][1-6]|body[12]|subtitle[12]|caption|overline)$/)) {
    return processTextClass(className);
  }
  
  // Classes de cor de fundo (bg-primary, bg-red, etc)
  if (className.match(/^bg-([a-z]+)$/)) {
    return processColorClass(className, 'background');
  }
  
  // Classes de cor de texto (text-primary, text-red, etc)
  if (className.match(/^text-([a-z]+)$/) && !className.match(/^text-([a-h][1-6]|body[12]|subtitle[12]|caption|overline)$/)) {
    return processColorClass(className, 'text');
  }
  
  // Classes de flexbox (row, column, etc)
  if (['row', 'column', 'items-start', 'items-center', 'items-end',
       'justify-start', 'justify-center', 'justify-end', 'justify-between',
       'content-start', 'content-center', 'content-end'].includes(className)) {
    return processFlexboxClass(className);
  }
  
  // Classes de alinhamento de texto
  if (['text-left', 'text-right', 'text-center', 'text-justify'].includes(className)) {
    return processTextAlignmentClass(className);
  }
  
  return null;
}

/**
 * Processa classes de espaçamento (margin e padding)
 */
export function processSpacingClass(className: string) {
  const match = className.match(/^q-([mp])([atrblxy])?-([a-z]+)$/);
  if (!match) return null;
  
  const [, type, direction, size] = match;
  
  // Mapear tamanhos para valores em pixels
  const sizeValues: Record<string, number> = {
    'none': 0,
    'xs': 4,
    'sm': 8,
    'md': 16,
    'lg': 24,
    'xl': 32
  };
  
  const sizeValue = sizeValues[size] || 0;
  const styles: Record<string, number> = {};
  
  // Margin ou padding
  const property = type === 'm' ? 'margin' : 'padding';
  
  // Aplicar em todas as direções
  if (!direction || direction === 'a') {
    styles[`${property}Top`] = sizeValue;
    styles[`${property}Right`] = sizeValue;
    styles[`${property}Bottom`] = sizeValue;
    styles[`${property}Left`] = sizeValue;
    return styles;
  }
  
  // Direções específicas
  if (direction === 't' || direction === 'y') {
    styles[`${property}Top`] = sizeValue;
  }
  if (direction === 'r' || direction === 'x') {
    styles[`${property}Right`] = sizeValue;
  }
  if (direction === 'b' || direction === 'y') {
    styles[`${property}Bottom`] = sizeValue;
  }
  if (direction === 'l' || direction === 'x') {
    styles[`${property}Left`] = sizeValue;
  }
  
  return styles;
}

/**
 * Processa classes de texto (text-h1, text-body1, etc)
 */
export function processTextClass(className: string) {
  switch (className) {
    case 'text-h1':
      return { fontSize: 48, fontWeight: 'bold', letterSpacing: -0.5 };
    case 'text-h2':
      return { fontSize: 40, fontWeight: 'bold', letterSpacing: -0.4 };
    case 'text-h3':
      return { fontSize: 34, fontWeight: 'bold', letterSpacing: -0.3 };
    case 'text-h4':
      return { fontSize: 28, fontWeight: 'bold', letterSpacing: -0.2 };
    case 'text-h5':
      return { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.1 };
    case 'text-h6':
      return { fontSize: 20, fontWeight: 'bold', letterSpacing: 0 };
    case 'text-subtitle1':
      return { fontSize: 16, fontWeight: 'regular', letterSpacing: 0.15 };
    case 'text-subtitle2':
      return { fontSize: 14, fontWeight: 'medium', letterSpacing: 0.1 };
    case 'text-body1':
      return { fontSize: 16, fontWeight: 'regular', letterSpacing: 0.5 };
    case 'text-body2':
      return { fontSize: 14, fontWeight: 'regular', letterSpacing: 0.25 };
    case 'text-caption':
      return { fontSize: 12, fontWeight: 'regular', letterSpacing: 0.4 };
    case 'text-overline':
      return { fontSize: 10, fontWeight: 'medium', letterSpacing: 1.5, textTransform: 'uppercase' };
    default:
      return null;
  }
}

/**
 * Processa classes de cor (bg-primary, text-red, etc)
 */
export function processColorClass(className: string, type: 'background' | 'text') {
  const match = className.match(/^(bg|text)-([a-z]+)$/);
  if (!match) return null;
  
  const colorName = match[2];
  if (!quasarColors[colorName]) return null;
  
  if (type === 'background') {
    return { fills: [{ type: 'SOLID', color: quasarColors[colorName] }] };
  } else {
    return { fontColor: quasarColors[colorName] };
  }
}

/**
 * Processa classes flexbox (row, column, etc)
 */
export function processFlexboxClass(className: string) {
  switch (className) {
    case 'row':
      return { layoutMode: 'HORIZONTAL' };
    case 'column':
      return { layoutMode: 'VERTICAL' };
    case 'items-start':
      return { counterAxisAlignItems: 'MIN' };
    case 'items-center':
      return { counterAxisAlignItems: 'CENTER' };
    case 'items-end':
      return { counterAxisAlignItems: 'MAX' };
    case 'justify-start':
      return { primaryAxisAlignItems: 'MIN' };
    case 'justify-center':
      return { primaryAxisAlignItems: 'CENTER' };
    case 'justify-end':
      return { primaryAxisAlignItems: 'MAX' };
    case 'justify-between':
      return { primaryAxisAlignItems: 'SPACE_BETWEEN' };
    case 'content-start':
      return { counterAxisAlignContent: 'MIN' };
    case 'content-center':
      return { counterAxisAlignContent: 'CENTER' };
    case 'content-end':
      return { counterAxisAlignContent: 'MAX' };
    default:
      return null;
  }
}

/**
 * Processa classes de alinhamento de texto
 */
export function processTextAlignmentClass(className: string) {
  switch (className) {
    case 'text-left':
      return { textAlignHorizontal: 'LEFT' };
    case 'text-right':
      return { textAlignHorizontal: 'RIGHT' };
    case 'text-center':
      return { textAlignHorizontal: 'CENTER' };
    case 'text-justify':
      return { textAlignHorizontal: 'JUSTIFIED' };
    default:
      return null;
  }
}

/**
 * Converte uma cor CSS para o formato Figma
 */
export function cssColorToFigmaColor(cssColor: string) {
  // Cores nomeadas do Quasar
  if (cssColor.startsWith('var(--q-')) {
    const colorMatch = cssColor.match(/var\(--q-([a-z]+)\)/);
    if (colorMatch && quasarColors[colorMatch[1]]) {
      return quasarColors[colorMatch[1]];
    }
  }
  
  // Hex
  if (cssColor.startsWith('#')) {
    let hex = cssColor.substring(1);
    
    // Converter #RGB para #RRGGBB
    if (hex.length === 3) {
      hex = hex.split('').map(h => h + h).join('');
    }
    
    // Extrair componentes RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Extrair alpha se disponível (#RRGGBBAA)
    let a = 1;
    if (hex.length === 8) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
    
    return { r, g, b, a };
  }
  
  // RGB/RGBA
  if (cssColor.startsWith('rgb')) {
    const values = cssColor.match(/\d+(\.\d+)?/g);
    
    if (values && values.length >= 3) {
      const r = parseInt(values[0]) / 255;
      const g = parseInt(values[1]) / 255;
      const b = parseInt(values[2]) / 255;
      const a = values.length === 4 ? parseFloat(values[3]) : 1;
      
      return { r, g, b, a };
    }
  }
  
  // Cores nomeadas comuns
  const namedColors: Record<string, { r: number, g: number, b: number, a?: number }> = {
    'white': { r: 1, g: 1, b: 1 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 1, g: 0, b: 0 },
    'green': { r: 0, g: 0.8, b: 0 },
    'blue': { r: 0, g: 0, b: 1 },
    'yellow': { r: 1, g: 1, b: 0 },
    'gray': { r: 0.5, g: 0.5, b: 0.5 },
    'transparent': { r: 0, g: 0, b: 0, a: 0 }
  };
  
  if (namedColors[cssColor]) {
    return namedColors[cssColor];
  }
  
  return null;
}