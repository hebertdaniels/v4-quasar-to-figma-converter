import { QuasarNode } from '../types/settings';
import { cssColorToFigmaColor } from './style-utils';

/**
 * Extrai estilos e props de um nó Quasar
 */
export function extractStylesAndProps(node: QuasarNode) {
  const props: Record<string, string> = {};
  const styles: Record<string, any> = {};
  
  // Lista de props comuns do Quasar
  const QUASAR_PROPS = [
    'color', 'label', 'dense', 'disable', 'dark', 'flat', 'outline', 
    'rounded', 'push', 'glossy', 'size', 'fab', 'stack', 'no-caps',
    'loading', 'percentage', 'dark-percentage', 'indeterminate',
    'value', 'ratio', 'label-always', 'checked', 'keep-color',
    'toggle-indeterminate', 'true-value', 'false-value',
    'indeterminate-value', 'persistent', 'placeholder',
    'error', 'error-message', 'maxlength', 'hint', 'autogrow',
    'counter', 'filled', 'standout', 'bottom-slots', 'autocomplete',
    'icon', 'icon-right', 'placeholder', 'prefix', 'suffix',
    'align', 'bordered'
  ];
  
  // Extrair atributos do nó
  if (node.attributes) {
    Object.keys(node.attributes).forEach(attr => {
      // Props do Quasar ou atributos personalizados v-model, :value, etc.
      if (QUASAR_PROPS.includes(attr) || attr.startsWith(':') || attr.startsWith('v-')) {
        props[attr.replace(/^[v:][-:]?/, '')] = node.attributes[attr];
      }
      
      // Extrair estilos inline
      if (attr === 'style') {
        const inlineStyles = parseInlineStyles(node.attributes.style);
        Object.assign(styles, inlineStyles);
      }
      
      // Extrair classes CSS
      if (attr === 'class') {
        props['class'] = node.attributes.class;
      }
    });
  }
  
  return { props, styles };
}

/**
 * Analisa string de estilos inline
 */
export function parseInlineStyles(styleString?: string) {
  if (!styleString) return {};
  
  const styles: Record<string, any> = {};
  const declarations = styleString.split(';');
  
  for (const declaration of declarations) {
    if (!declaration.trim()) continue;
    
    const parts = declaration.split(':');
    if (parts.length !== 2) continue;
    
    const [property, value] = parts.map(s => s.trim());
    if (property && value) {
      // Converter para camelCase para compatibilidade com JS
      const camelProperty = property.replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());
      
      // Processar valores especiais (cores, unidades, etc.)
      if (property.includes('color')) {
        // Converter cores para formato Figma
        const figmaColor = cssColorToFigmaColor(value);
        if (figmaColor) {
          styles[camelProperty] = figmaColor;
          continue;
        }
      }
      
      // Processar valores com unidades (px, em, rem, etc.)
      if (value.match(/^-?\d+(\.\d+)?(px|em|rem|vh|vw|%)$/)) {
        const numValue = parseFloat(value);
        const unit = value.replace(/^-?\d+(\.\d+)?/, '');
        
        // Converter unidades para pixels (aproximação simples)
        if (unit === 'px') {
          styles[camelProperty] = numValue;
        } else if (unit === 'rem' || unit === 'em') {
          // Considerando 1rem = 16px (aproximação padrão)
          styles[camelProperty] = numValue * 16;
        } else {
          // Para outras unidades, manter o valor original como string
          styles[camelProperty] = value;
        }
        continue;
      }
      
      // Para outros valores, manter como string
      styles[camelProperty] = value;
    }
  }
  
  return styles;
}

/**
 * Encontra um filho com uma determinada tag
 */
export function findChildByTagName(node: QuasarNode, tagName: string): QuasarNode | null {
  if (!node.childNodes || node.childNodes.length === 0) {
    return null;
  }
  
  // Converter para minúsculas para comparação case-insensitive
  const targetTag = tagName.toLowerCase();
  
  for (const child of node.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === targetTag) {
      return child;
    }
    
    // Busca recursiva
    const found = findChildByTagName(child, tagName);
    if (found) {
      return found;
    }
  }
  
  return null;
}

/**
 * Encontra todos os filhos com uma determinada tag
 */
export function findChildrenByTagName(node: QuasarNode, tagName: string): QuasarNode[] {
  const results: QuasarNode[] = [];
  
  if (!node.childNodes || node.childNodes.length === 0) {
    return results;
  }
  
  // Converter para minúsculas para comparação case-insensitive
  const targetTag = tagName.toLowerCase();
  
  for (const child of node.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === targetTag) {
      results.push(child);
    }
    
    // Busca recursiva
    const childResults = findChildrenByTagName(child, tagName);
    results.push(...childResults);
  }
  
  return results;
}

/**
 * Detecta o tipo de layout com base no nó raiz
 */
export function detectLayoutType(node: QuasarNode): string {
  const tagName = node.tagName.toLowerCase();
  
  // Componentes de layout
  if (tagName === 'q-layout') {
    const hasDrawer = findChildByTagName(node, 'q-drawer');
    const hasHeader = findChildByTagName(node, 'q-header');
    
    if (hasDrawer && hasHeader) {
      return 'app-layout-with-drawer';
    } else if (hasHeader) {
      return 'app-layout';
    }
    return 'basic-layout';
  }
  
  if (tagName === 'q-page') {
    return 'page-only';
  }
  
  if (tagName === 'q-tabs' || findChildByTagName(node, 'q-tabs')) {
    return 'tabs-layout';
  }
  
  // Componentes individuais
  if (tagName === 'q-card' || findChildByTagName(node, 'q-card')) {
    return 'card-layout';
  }
  
  if (tagName === 'q-form' || findChildByTagName(node, 'q-form')) {
    return 'form-layout';
  }
  
  if (tagName === 'q-btn') {
    return 'button-component';
  }
  
  // Componentes de formulário
  if (['q-input', 'q-select', 'q-checkbox', 'q-radio', 'q-toggle', 'q-file'].includes(tagName)) {
    return 'form-component';
  }
  
  if (tagName === 'q-list' || findChildByTagName(node, 'q-list')) {
    return 'list-layout';
  }
  
  return 'unknown';
}

/**
 * Extrai o texto de um botão a partir de várias fontes possíveis
 */
export function getButtonText(node: QuasarNode): string {
  // Verificar atributo label
  if (node.attributes && node.attributes.label) {
    return node.attributes.label;
  }
  
  // Verificar conteúdo de texto direto
  for (const child of node.childNodes) {
    if (child.tagName === '#text' && child.text && child.text.trim()) {
      return child.text.trim();
    }
  }
  
  // Verificar filhos para span ou outros elementos de texto
  for (const child of node.childNodes) {
    if (child.tagName && ['span', 'div'].includes(child.tagName.toLowerCase())) {
      // Extrair texto recursivamente do filho
      const childText = getButtonText(child);
      if (childText) {
        return childText;
      }
    }
  }
  
  // Texto padrão se nada for encontrado
  return "Botão";
}

/**
 * Extrai texto de um nó, seja diretamente ou de seus filhos
 */
export function extractNodeText(node: QuasarNode): string {
  // Se for nó de texto, retornar o texto diretamente
  if (node.tagName === '#text' && node.text) {
    return node.text.trim();
  }
  
  // Se tiver filhos, combinar o texto de todos eles
  let combinedText = '';
  
  for (const child of node.childNodes) {
    combinedText += extractNodeText(child) + ' ';
  }
  
  return combinedText.trim();
}