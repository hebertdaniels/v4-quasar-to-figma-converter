/**
 * Extrai estilos do componente Vue
 */
export function extractStyles(code: string) {
    const styleMatch = code.match(/<style(\s+scoped)?>([\s\S]*?)<\/style>/);
    
    if (!styleMatch) {
      return null;
    }
    
    const isScoped = !!styleMatch[1];
    const styleContent = styleMatch[2].trim();
    
    return {
      isScoped,
      content: styleContent
    };
  }
  
  /**
   * Processa estilos inline do Vue
   */
  export function parseInlineStyles(styleString?: string) {
    if (!styleString) return {};
    
    const styles: Record<string, string> = {};
    const declarations = styleString.split(';');
    
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // Converter para camelCase para compatibilidade com JS
        const camelProperty = property.replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());
        styles[camelProperty] = value;
      }
    }
    
    return styles;
  }
  
  /**
   * Extrai cores do CSS
   */
  export function extractColorsFromCss(css: string) {
    const colors: Record<string, number> = {};
    const colorRegex = /(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\))/g;
    
    let match;
    while ((match = colorRegex.exec(css)) !== null) {
      const color = match[1];
      colors[color] = (colors[color] || 0) + 1;
    }
    
    return colors;
  }